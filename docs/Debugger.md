# Pending Proposal: Attachable GQty Diagnostics

**Status: Proposal. Not implemented.**

Provide developers and coding agents with focused, structured answers about a
running GQty client. Prefer attaching to an existing runtime over a full CLI
subcommand suite, a separate always-listening service, or parsing console logs.
The interface must make discovery and filtering easy while bounding output so an
agent can investigate without filling its context with unrelated evidence.

This proposal does not authorize implementation or supersede the current
[Core](CoreDesign.md), [React](ReactDesign.md), or [Solid](SolidDesign.md)
architecture documents. The case studies are representative, not proof that every
application defect can be automatically diagnosed.

## Recommendation

Use the **Chrome DevTools Protocol (CDP) as the first attachment transport**, with
a small, versioned, opt-in GQty diagnostics interface in the target runtime.

- CDP attaches to Chromium and Node/V8 runtimes. The GQty interface supplies the
  domain-specific state and evidence that a generic debugger cannot infer.
- An MCP adapter may expose the same operations to agents that use MCP; it is not
  the source of truth or a requirement to connect a debugger.
- OpenTelemetry (OTEL) export is optional for teams using distributed tracing.
  OTLP is a telemetry transport, not a standard interactive current-state query
  protocol.
- WebDriver BiDi and Debug Adapter Protocol (DAP) are possible later adapters.
- Keep `@gqty/logger` for human-oriented console output. Do not require it for
  structured diagnostics.

The ordinary workflow is **attach → discover clients → ask a focused question →
receive a bounded answer → inspect evidence if needed**. Protocol method names and
wire formats remain undecided; examples below are illustrative.

### Attachment is not instrumentation

A debugger can inspect a live process but cannot reconstruct a past fetch decision
that was never recorded. GQty needs an opt-in provider and, for history, a bounded
buffer or live subscription. If observation began too late, report that explicitly.

Browser pages, frames, workers, and Node processes can have different targets and
execution contexts. Some may not be attachable, and production builds may omit
diagnostics. “Not found in this context” is not proof that no GQty client exists.

CDP is privileged: `Runtime.evaluate` can execute arbitrary code. A read-only
GQty interface does **not** make the underlying debugger connection read-only.
Use an already-authorized connection; do not expose an inspector publicly.

## Current evidence and limitations

[`subscribeDebugEvents`](../packages/gqty/src/Client/debugger.ts) exposes a request,
selection set, optional cache, and optional result promise.
[`@gqty/logger`](../packages/logger/src/index.ts) presents queries, variables,
results, selections, timing, and optional cache snapshots. The cache, resolver,
and framework adapters hold additional relevant state.

The existing surface is useful, but it is not yet a complete queryable diagnostic
model:

1. A debug event does not explain every fetch scheduling decision.
2. Its selection set and cache are live objects, not immutable historical receipts.
3. A result promise and cache snapshot are not inherently bounded, filtered output.
4. The [query-builder hash](../packages/gqty/src/QueryBuilder.ts) is used for
   runtime deduplication and includes query/variables; do not assume it is a
   persisted-document hash.
5. Debug dispatch awaits listeners. An async listener may affect completion or
   propagate failure; do not claim the current hook is timing-neutral.
6. Expiry, weak-reference eviction, and suppressed notifications limit what can be
   inferred from notifications alone.

## Representative case studies

The “needed evidence” column describes the target, not a claim that current GQty
already exposes it. All findings should separate observed facts from hypotheses.

### Requests

| Case | User question | Needed evidence | Current visibility |
| --- | --- | --- | --- |
| Repeated requests | Why is this query firing repeatedly? | Counts by operation and cache path; fetch intent; selection revisions; intervening writes; retries | Logger shows requests/results, not a proven causal cycle. |
| Unexpected request | Why did this fetch? | Policy, triggering selection, cache state at decision time, and trigger such as refetch or interval | Resolver flags exist; no durable per-decision explanation. |
| Missing request | Why did this field not fetch? | Selection observed or declared, resolver state, policy decision, null ancestor, in-flight work, error | Pieces are inspectable indirectly; no consolidated answer. |
| Duplicate requests | Why did two components request the same data? | Operation and variable identity, participants, batch, dedupe outcome, actual dispatch count | Payload is visible; participant/dedupe provenance is not directly reported. |
| Waterfall | Why did this take several round trips? | Ordered operations, first selection discovery, prerequisites, cache state, preparation | Logger shows approximate timing, not discovery causality. |
| Retry or subscription loop | Is this a runtime loop or transport failure? | Attempts, retry reasons, GraphQL/network errors, subscription lifecycle and timing | Some results/errors are visible; lifecycle coverage is incomplete. |

### Cache and selection

| Case | User question | Needed evidence | Current visibility |
| --- | --- | --- | --- |
| Null ancestor | Why was a descendant not fetched? | Null result, declared or previously observed descendants, whether the path was ever captured | Previously selected descendants can be replayed; never-captured paths cannot be inferred. |
| Partial hit | Why did cached data still fetch? | Selected paths classified at decision time as fresh, stale, absent, null-satisfied, or unknown | Cache/context contain pieces, not an immutable receipt. |
| Stale data | Why does the UI show old data? | Policy, age/expiry, last write, observed invalidation, suppressed notification | Metadata exists; causal and observer linkage is incomplete. |
| Disappearing fields | Why did another query remove a field? | Argument-sensitive cache path, selection coverage, normalization mode, relevant write order | Snapshots may help; coverage and write provenance are not directly correlated. |
| Wrong object update | Why do two records share data? | Normalization mode, identity policy, opaque entity identity, affected paths | Configuration exists but currently requires internal inspection. |
| Missing notification | Why did the component not update? | Write ID, `skipNotify`, subscribed path, actual notification, adapter lifecycle | Cache and adapter evidence are not a single correlated trace. |
| Eviction or expiry | Why did a value disappear? | Expiry, relevant read time, last known retention, whether eviction was observable | Weak-reference collection cannot be reconstructed after the fact without observation. |
| Prepared-selection mismatch | Why was a render read outside preparation? | Declared selection, reached read, activation condition, operation identity | Future capability; see [Prepared and Persisted Queries](PersistentQuery.md). |

A null ancestor must not automatically be described as a missing field. Distinguish
**declared and null-satisfied**, **previously observed but currently unreachable**,
**never observed**, and **unknown because observation began too late**.

### Framework and lifecycle

| Case | User question | Needed evidence | Current visibility |
| --- | --- | --- | --- |
| React rerender/refetch | Why does rendering lead to another fetch? | Adapter fetch intent, resolver generation, selection changes, cache notifications, completion | React coordinates these, but core events do not expose the full decision chain. |
| Suspense pending | What is this component waiting for? | Resource/resolver identity, pending work, age, settlement/failure, generation | No unified stable inspection contract. |
| Error delivery | Why did the boundary not show the error? | Result, retry outcome, resolver state, adapter delivery state | Errors may be logged, but cross-layer delivery is not correlated. |
| Stale completion | Did older work overwrite newer state? | Dispatch/completion and cache-write order, generation, supersession/ownership | No general provenance chain. |
| Solid resource stalls | Why is the resource still pending? | Resolver lifecycle, resource/refetch state, mutex ownership and settlement | Adapter state is not surfaced through core debug events. |
| SSR/hydration mismatch | Why did server and client disagree? | Separate runtime/client identities, server operation summary, hydration and client coverage | Requires explicit cross-runtime correlation. |

Core must not guess why an adapter scheduled work. React and Solid evidence needs
adapter-owned instrumentation, with unavailable layers marked as such.

### Identity, deployment, and safety

| Case | User question | Needed evidence | Current visibility |
| --- | --- | --- | --- |
| Persisted query rejected | Why did the server reject this operation? | Document identity, persisted hash/protocol, error category, fallback | Future capability; current dedupe hash is insufficient. |
| Wrong variables | Why was another ID used? | Variable names and safe equality/correlation; raw values only on explicit request | Raw variables are present in debug events; safe filtering is not built in. |
| Multiple clients | Which client is this component using? | Runtime, client and cache identities; adapter association when known | No standard discovery/correlation interface. |
| Data exposure | What did diagnostics capture? | Active policy, included fields, destination, drops/truncation, expiry | Must be designed; logger can print variables, results, and cache snapshots. |
| Observer interference | Did debugging change the behavior? | Capture settings, buffer pressure, dropped events, measured overhead | Current listeners may affect operation completion. |
| Late attachment | Why cannot the earlier request be explained? | Capture start, retained range, drops, instrumentation capabilities | Attaching cannot recover unrecorded history. |

## Interface comparison

| Interface | Strength | Limitation | Role |
| --- | --- | --- | --- |
| `@gqty/logger` | Human-readable operations and cache | Noisy, limited causal context | Keep for humans. |
| Current core debug hook | Programmatic request/result access | Live objects, incomplete lifecycle, observer interference | Existing foundation to evolve. |
| Browser Network/console | Wire traffic, errors, timing | Cannot reliably explain resolver/cache decisions | Corroborating evidence. |
| Generic debugger | Attachment, breakpoints, live objects | Requires internals knowledge; pausing changes timing; no past causality | Transport and investigation aid. |
| CDP | Structured Chromium and Node/V8 debugger transport | Privileged evaluation; target/context discovery; not universal | First attachment transport. |
| WebDriver BiDi | Browser automation and script execution | Browser-oriented, not a GQty domain model | Possible later adapter. |
| DAP | IDE attach/debug interoperability | Needs an adapter; not GQty-specific | Possible later adapter. |
| MCP | Agent-facing tool discovery and structured calls | Does not itself attach to a browser or process | Optional adapter. |
| OTEL/OTLP | Telemetry and cross-service correlation | Not an interactive live-state inspection protocol | Optional export. |
| Apollo/TanStack-style devtools | Human cache and query views | UI alone is not an agent interface | UX reference. |

## Proposed domain interface

The GQty interface is a domain protocol, not a new network listener. An attachment
adapter invokes it in the correct target/context. Conceptual operations:

- **Discover:** clients, caches, framework associations, protocol version,
  supported capabilities, and capture status.
- **Inspect:** bounded current operation, resolver, selection, and cache metadata.
- **Observe:** a filtered, bounded event window or subscription.
- **Explain:** recorded evidence for a specific fetch, decision, or invalidation.

The exact methods, transport serialization, discovery mechanism, and browser/Node
integration remain open. The interface should not claim a universal zero-config
connection before those environments have been designed and validated.

### Discovery and current state

Expose opaque runtime, client, cache, resolver, and operation IDs; supported
capabilities; capture start and retained range; dropped/truncated counts; active
operations; pending/idle/error state; selection count or revision where available;
cache policy; normalization mode; and aggregate errors/retries. Report known
limitations. Do not assume all framework adapters supply the same information.

### Decision receipts

The highest-value addition is a compact, immutable record of **why GQty decided to
fetch or not fetch**, captured at decision time rather than reconstructed from a
later cache state. Include resolver and selection revision, outcome, reason codes,
related request, and evidence IDs where available.

Candidate reasons include missing or expired data, explicit refetch, adapter-provided
mount/render policy, interval/reconnect/visibility, retry, joining in-flight work,
fresh data, and a null ancestor satisfying the selection. Support `unknown` and
`not_instrumented`; never guess an adapter's intent.

### Bounded causal events

Where actually recorded, correlate selection acceptance/retirement, fetch intent
and decision, batch participation, dedupe outcome, dispatch, settlement, retry,
cache writes, notifications or suppression, adapter delivery/disposal, and capture
gaps. A causal edge must be explicit; temporal adjacency alone is not proof.

An answer may group repeated activity and provide evidence IDs:

```json
{
  "question": "repeated_requests",
  "window": "10s",
  "observation": {
    "requests": 12,
    "successful": 12,
    "selection_shapes": 2,
    "shared_cache_paths": ["path:4"]
  },
  "evidence": ["event:31", "event:34", "event:39"],
  "assessment": { "kind": "possible_feedback", "cause": "unknown" },
  "limits": ["capture_started_after_first_request"]
}
```

The example is illustrative. It reports a pattern, not a proven root cause.

### Details on demand

Operation documents, selection paths and argument names, scoped cache metadata,
error details, raw variables, response data, and cache values should not be dumped
by default. Provide explicit requests and appropriate authorization/redaction for
sensitive details. Operation names, paths, error messages, and metadata can also be
sensitive.

## Agent-friendly bounds and consistency

- Filter within the runtime interface before serialization: by client, resolver,
  operation, request, path, event category, and time range where supported.
- Support summary and detail levels, explicit maximum records/bytes, and stable
  cursor pagination. Return counts, representative evidence IDs, and truncation.
- Report capture start, buffer overflow, dropped events, unavailable capabilities,
  and cursor gaps. A partial capture must never appear complete.
- Snapshot responses must identify their observation time and consistency limits.
  An unchanged event revision cannot certify cache freshness across quiet expiry,
  weak eviction, or deliberately suppressed notifications.
- Use session-local opaque IDs. Unsalted hashes of low-entropy values are not
  privacy protection; session-scoped keyed correlation needs a defined lifetime.
- Do not retain cache data, promises, components, or resolvers beyond their normal
  lifetime. Diagnostics must not alter cache retention or TTL.
- Inspection must not trigger selections, cache mutations, or refetches.
- No mandatory CLI suite, MCP server, collector, or automatic upload.

Default limits should be configurable and measured, not treated as permanently
settled constants.

## Safety and operational boundaries

1. Instrumentation is opt-in; no implicit public listener.
2. Debugger access remains privileged even if GQty operations are read-only.
3. Read-only domain operations are the default; no cache writes or refetches.
4. No sensitive values by default. Explicitly scope any elevated inspection.
5. OTEL export is independently configured; do not upload automatically.
6. Bound memory and work; report drops or aggregation under pressure.
7. Isolate observers from the request critical path. Their errors must not fail
   the application or intentionally block scheduling.
8. Development defaults do not imply safe production inspector deployment.

Instrumentation consumes time and memory. Do not promise literal zero impact;
the target is no intentional blocking or semantic dependency, with measured
resource overhead and explicit limits.

## Phased direction

1. **Attach and discover:** opt-in, versioned read-only interface; CDP attachment
   to Chromium and Node; client discovery, capabilities, bounded operation
   summaries, and explicit unavailable/wrong-context states. No causal claims.
2. **Fetch decision evidence:** immutable bounded receipts; correlation among
   selection, fetch intent, request, and cache write where known; capture windows,
   dropped-event counts, and filtering before serialization.
3. **Framework and cache depth:** React/Solid adapter evidence, null-satisfied vs
   missing coverage, notification suppression, batching, dedupe, supersession,
   and no accidental cache retention.
4. **Optional integrations:** MCP adapter, OTEL export, BiDi/DAP adapters, and a
   human-facing UI where justified.

All phases are proposals. Existing logger and debug hooks remain useful; no
replacement, complete causal model, or production deployment is implied.

## References

- [Chrome DevTools Protocol: Runtime](https://chromedevtools.github.io/devtools-protocol/v8/Runtime/)
- [Node.js inspector and security](https://nodejs.org/en/learn/getting-started/debugging)
- [WebDriver BiDi](https://w3c.github.io/webdriver-bidi/)
- [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/specification)
- [MCP tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otlp/)
- [Apollo Client Devtools](https://github.com/apollographql/apollo-client-devtools)
- [TanStack Query Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools)
