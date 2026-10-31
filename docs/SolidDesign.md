# Solid Design

## Boundary

The Solid adapter translates an existing Core client into Solid resources,
signals and effects. Core owns query selections, batching, fetch/cache policy
and resolver participant settlement. Solid owns reactive delivery, loading, errors,
Suspense and scope disposal. The supported peer range is `solid-js ^1.9.18`;
this implementation does not use Solid 2 interfaces.

[`createSolidClient`](../packages/solid/src/index.ts) assembles `createQuery`,
`createMutation` and `createSubscription` around the same client and defaults.
The query bridge is in [`query.ts`](../packages/solid/src/query.ts).

## Query Lifecycle

1. Each `createQuery()` creates one isolated Core resolver and accessor.
   Accepted selections schedule a debounced soft refetch. With `prepare`, only
   selections captured inside that callback are accepted.
2. A `fetchVersion` signal drives native `createResource`. Its async fetcher
   directly awaits Core's `resolve()` and returns the accessor. Solid owns the
   actual pending/error lifecycle; no external deferred or resource-action
   refetch handoff can settle it early.
3. Before fetching, the bridge captures the selected cache paths and detaches
   cache observation. After success, observation is restored unless disposed.
   Idle cache notifications enqueue `mutate(() => accessor)` to publish the
   accessor through the resource's signal storage (`equals: false`). They do
   not complete fetch promises or reset Core's participant state.
4. Only the current fetch retires `activeFetch`. If Core still has selections
   and fetch intent afterward, completion schedules another soft refetch.
   Distinct late selections and their flags remain Core-owned.
5. Fetch starts and cache publications are microtask-batched. Guards prevent
   them from running while another fetch is active or after disposal.

## Refetch And Preparation

`$refetch(ignoreCache = true)` restores the last successful selections before
requesting work. Calls while fetching or disposed return without starting
another request. Explicit hard refetches bypass freshness; ordinary temporary-cache
refreshes also force fetching, but selection-only passes do not force a request
solely because the resolver uses a temporary cache.

For finite cache age, soft refetches re-read selections through `prepass` or the
user's `prepare` callback to refresh Core's freshness flags. A fresh cache pass
installs observation, resets context and clears that pass without fetching.
`prepass` remains a current Core integration API.

Initial `prepare` collection runs under the same selection guard and advances
the same resource source when fetching is needed. It does not start a separate
promise handoff. Mount, interval, reconnect and visibility effects use the same
refetch path.

## Disposal And Public State

Disposal removes queued starts/publications and releases cache observation.
In-flight completion cannot reinstall observation afterward. The adapter does
not cancel transport work that Core may share with other consumers.

The public query accessor reads `resource()?.query ?? accessor.query`.
`$state.loading` and `$state.error` come from the native resource; resource reads
deliver pending work and errors through Solid's Suspense/ErrorBoundary
behavior.
Cache observation is not a second async-completion mechanism.

## Other Primitives And Limits

[`createMutation`](../packages/solid/src/mutation.ts) remains a thin call to
`client.resolve()`.
[`createSubscription`](../packages/solid/src/subscription.ts) keeps its resolver,
debounced selection subscription and signal-based delivery.
Neither primitive was redesigned by the query lifecycle correction.

This bridge does not change Core cache replacement/normalization policy or
define a new global last-response notification contract. Broader Core/React
architectural proposals remain separate from the implemented Solid bridge.
