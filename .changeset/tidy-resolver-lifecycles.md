---
'gqty': patch
'@gqty/solid': patch
---

Correct shared query lifecycle ownership and reject malformed response aliases.

Core now settles every resolver participating in a shared batch and preserves
unfetched selections added while a request is active. Query and mutation
responses that omit a requested root alias fail with a terminating `GQtyError`
instead of caching malformed data. Valid null-valued fields, partial GraphQL
errors and subscription behavior remain unchanged; this is not full schema
validation.

The Solid adapter lets native `createResource` own Core resolution and error
delivery, separates idle cache observation from fetch completion, and guards
queued work and observation after disposal. The unused `p-defer` dependency is
removed. The adapter now requires `solid-js ^1.9.18`; Solid 2 is not supported
by this change.
