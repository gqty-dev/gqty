# Pending Feature: Prepared and Persisted Queries

**Status: Pending proposal. Not implemented.**

This document records the planned direction for cache-independent preparation,
optional static extraction, and persisted queries. It does not authorize a broad
runtime rewrite or supersede the local Core, React, or Solid architecture notes.
Record adopted architecture changes in the appropriate architecture documentation
when implemented.

“Persisted queries” here means server-recognized GraphQL operation documents or
hashes, not persistence of the client cache.

## Goal and developer-facing contract

Preserve GQty's combined selection-and-data interface. Do not introduce a new
conditional helper, query language, or application-level dependency pattern.

| Usage | Intended mental model |
| --- | --- |
| Ordinary query reads | GQty fetches what the executed code reads. |
| `useQuery({ prepare })` | Declare the fields this query needs, independently of cached values. |
| Optional compilation | Package the same prepared operation ahead of time, including persisted-query artifacts. |

Dynamic querying remains legitimate production usage. Preparation offers
predictable operation ownership and reduces discovery waterfalls; it is not a
requirement for making an application production-safe. Compilation remains
optional and targets deployments using persisted-query-capable servers.

## The nullable-selection limitation

```tsx
const query = useQuery();
return query.viewer?.profile?.name ?? 'Anonymous';
```

When cached `viewer` is null, the ordinary accessor must return actual null.
JavaScript then stops evaluating the path. No proxy can discover `profile.name`
from that execution without changing JavaScript value semantics.

The normal query pattern keeps these semantics:

- Return actual nulls; do not substitute truthy proxy objects.
- Previously captured descendant selections can be retained or reused. This is
  not discovery of descendants that have never been read.
- If the parent later becomes an object, newly reachable reads can discover
  additional fields and require another request.
- Null alone is not a reason to fetch repeatedly. Freshness, invalidation, and
  explicit refetch govern when the parent is requested again.
- An error-free null response satisfies the selected subtree for that result.
  Descendants are unreachable, not missing fields demanding another fetch.
  GraphQL errors remain subject to the normal error policy.

Current [accessor resolution](../packages/gqty/src/Accessor/resolve.ts) returns
null and signals selection handling. The [resolver](../packages/gqty/src/Client/resolvers.ts)
can replay previously selected descendants. Neither this mechanism nor the
current [prepass helper](../packages/gqty/src/Helpers/prepass.ts) discovers new
paths beneath cached nulls.

This proposal does not claim to remove that limitation from ordinary dynamic
queries. Versioning captured selections alone cannot recover unexecuted reads.

## Planned runtime preparation contract

```tsx
const query = useQuery({
  prepare({ query }) {
    query.viewer?.profile?.name;
  },
});

return query.viewer?.profile?.name ?? 'Anonymous';
```

Inside `prepare`, a selection-only accessor is independent of cache values.
Nullable objects remain traversable so the complete path can be captured.
Outside `prepare`, the hook's returned accessor continues to expose actual
cached values, including nulls.

The prepared descendants remain part of future requests even after a null
response. Their continued declaration must not itself cause a refetch loop.

**This behavior must work without compilation.** It is a runtime feature, not
merely a linter or compiler improvement.

Preparation defines the complete operation rather than merely seeding later
capture. Render reads must not silently extend a prepared operation, especially
when its document is identified by a persisted hash. Reached reads outside the
prepared selection should receive useful development diagnostics. Observation
cannot prove coverage of branches that never execute.

The [current React API](../packages/react/src/query/useQuery.ts) describes
`prepare` as early selection for first-render fetching/Suspense. Making it
cache-independent and authoritative strengthens that contract. Compatibility
and migration must be designed explicitly, not introduced as a silent build
optimization.

## Conditionals without new helpers

The developer-facing rule is semantic, not a JavaScript syntax checklist:

> Application inputs may control preparation. Query results may not.

```ts
// Intended to be supportable: an application input controls selection.
if (showEmail) query.viewer.email;

// Not a preparation-time decision: the predicate needs response data.
if (query.viewer.canManageUsers) query.managementReport.total;
```

Ordinary query usage still supports value-dependent conditions. Newly reachable
reads may require another network request. Accept that GraphQL limitation rather
than adding a conditional helper or exposing a dependency-plan abstraction.

Standard GraphQL `@include` and `@skip` accept Boolean inputs, not references to
sibling response fields. They can express client-known conditions, but cannot
turn the second example into a single-request response-dependent operation.
See the [GraphQL directive specification](https://spec.graphql.org/September2025/#sec--include).

Do not automatically fetch both branches to make extraction succeed. That can
change cost, error behavior, and which data is requested. Do not execute callbacks
against fabricated scalar values and claim to have discovered every branch.

## Optional compiler and linter

Static extraction is scoped to `useQuery({ prepare })`, not arbitrary render code.
Unsupported preparation patterns fail an opted-in compilation at build time;
there is no silent best-effort extraction presented as complete.

A prepare-scoped linter should be useful without enabling persisted-query
compilation. Diagnostics should explain the semantic problem and identify its
source, rather than require developers to memorize allowed syntax nodes.

For example:

> `canManageUsers` is response data. `prepare` declares selections before that
> response exists. Move this condition to ordinary query usage, or prepare both
> fields if unconditional fetching is intended.

Exact supported JavaScript remains an open design decision. Initial candidates
include schema property access, argument calls, local accessor aliases, optional
chaining, and application-input conditions. Accessor-consuming helpers, computed
field names, and loops need explicit extraction rules or precise diagnostics.
Even prepare-scoped linting needs bounded semantic analysis to follow aliases
and distinguish query-derived values from external inputs; syntax alone is not
sufficient. The compiler is authoritative, and lint rules should agree with it.

For supported callbacks, compiled and uncompiled preparation must have the same
selection, variable-binding, and activation semantics. Compilation must not
silently change the meaning of the application.

## Generated artifacts and operation identity

A static document does not imply static input values. For example,
`query.user({ id })` still needs to bind the current `id` at runtime.

The internal compiled representation must preserve:

- Operation document and persisted identity/hash.
- Runtime variable bindings.
- Conditional activation information where applicable.
- Selection metadata required by the resolver and cache.

Replacing `prepare` with an undocumented string was considered, but a bare string
is insufficient for the general case. The artifact format remains undecided and
need not become public API. Developers should be able to inspect generated
operations, variables, and source locations without managing this format.

Strict persisted operations must retain their document identities through
execution. Arbitrarily unioning active resolver selections can create a document
with no build-time hash. Transport batching, where supported, is distinct from
rewriting operation documents. The interaction with existing cofetching and
non-normalized cache coverage must be resolved before migration.

## Phased roadmap

1. **Settle the runtime contract.** Define authoritative preparation, input
   changes and inactive branches, selection lifetime across nulls, and migration
   from today's early-selection behavior. Keep ordinary dynamic usage unchanged.
2. **Implement cache-independent preparation.** Use the existing resolver/query
   pipeline. Preserve normal data/null semantics and defined loading, error,
   refetch, and Suspense behavior. Do not require a compiler for correctness.
3. **Add preparation diagnostics.** Establish shared extraction rules and useful
   lint/development errors. Do not label observed runtime coverage complete.
4. **Add optional compilation and persisted artifacts.** Preserve runtime
   bindings and prepared semantics, define server integration and operation
   identity, and make generated operations inspectable.

These are pending feature phases, not completed work or authorization to
implement them. This feature alone does not justify a broad rewrite.

## Outstanding decisions

- How to migrate existing `prepare` callbacks that rely on cached values or
  additive render-time selections.
- The exact analyzable subset and supported helper contracts.
- How application-input conditions map to directives, bounded document variants,
  or inactive operations, consistently with uncompiled preparation.
- How nullable collections, empty lists, abstract types, and argument identities
  participate in declaration and coverage.
- How to diagnose reads outside prepared coverage without treating an inactive
  declared branch as an undeclared field.
- Artifact shape, variable binding, canonicalization/hashing, and supported
  persisted-query server protocols.
- How fixed prepared operations coexist with dynamic consumers, batching, and
  non-normalized cache writes without losing coverage or creating feedback.

## Scope boundary

No new conditional helper, mandatory compilation, arbitrary-JavaScript extraction,
custom server execution directive, or replacement query engine is proposed.
The intended change is unchanged everyday ergonomics, stronger runtime semantics
for `prepare`, and optional tooling around that contract.
