---
'@gqty/cli': minor
'gqty': minor
---

New option `"fetchOptions"`, added to the [`resolved`](https://gqty.dev/docs/client/fetching-data#resolved) client function, that allows for giving extra configurations to the expected [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call.

This enables, for example, the customization of the headers sent for a specific query or to pass an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

```ts
import { resolved, query } from '../gqty';

// ...

const controller = new AbortController();

await resolved(() => query.currentUser?.email, {
  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
      authorization: 'secret_token',
    },
    signal: controller.signal,
  },
});
```

For already generated clients to be able to use this new option, it is required manually modify the existing query fetcher, to do for example:

```ts
const queryFetcher: QueryFetcher = async function (
  query,
  variables,
  fetchOptions
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    ...fetchOptions,
  });

  const json = await response.json();

  return json;
};
```
