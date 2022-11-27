import { renderHook } from '@testing-library/react-hooks';

import { createReactTestClient } from './utils';

test('Basic Non-Suspense', async () => {
  const { useQuery } = await createReactTestClient();

  const { result, waitFor } = renderHook(() => {
    const query = useQuery({
      suspense: false,
    });

    return {
      hello: query.hello,
      $state: query.$state,
    };
  });

  expect(result.current.hello).toBe(undefined);

  await waitFor(() => result.current.$state.isLoading === true);

  expect(result.current.hello).toBe(undefined);

  await waitFor(() => result.current.$state.isLoading === false);

  expect(result.current.hello).toBe('hello world');
});

test('Basic Suspense', async () => {
  const { useQuery } = await createReactTestClient();

  const { result, waitForNextUpdate } = renderHook(() => {
    const query = useQuery({
      suspense: true,
    });

    return query.hello;
  });

  expect(result.current).toBe(undefined);

  await waitForNextUpdate();

  expect(result.current).toBe('hello world');
});

it.only('should fetches with operation name', async () => {
  let fetchedQuery: string | undefined;
  const { useQuery } = await createReactTestClient(undefined, (query) => {
    fetchedQuery = query;
    return { data: { hello: 'hello world' } };
  });

  const { result, waitForNextUpdate } = renderHook(() => {
    const query = useQuery({
      operationName: 'TestQuery',
      suspense: true,
    });

    return query.hello;
  });

  expect(result.current).toBe(undefined);

  await waitForNextUpdate();

  expect(fetchedQuery).toBe('query TestQuery{hello}');
  expect(result.current).toBe('hello world');
});
