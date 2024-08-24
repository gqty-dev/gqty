# Coverage Checklist

This is an internal documentation for contributors who wants to build a new
package on top of GQty core.

This article serves as a first draft of a checklist, and is written from the
experience of building `@gqty/solid` from the ground up.

1. It MUST support Query, Mutation and Subscription operations.
2. It MUST expose a Proxy object as the main selection API.
3. When valid selections are made, it SHOULD fetches automatically on the
   nearest time window where it makes sense to the current implementation.
4. It SHOULD combine multiple queries into a single request when possible,
   without introducing visible delay.
5. It MUST render cache updates, regardless of the source being remote data
   fetch or local optimistic values.
