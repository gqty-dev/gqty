import { renderHook, waitFor } from '@testing-library/react';
import { Cache, type QueryPayload } from 'gqty';
import { act } from 'react';
import { createMockReactClient, createReactTestClient, sleep } from './utils';

describe('useQuery', () => {
  describe('isLoading', () => {
    it('should respect initial loading state', async () => {
      const { useQuery } = await createReactTestClient();

      const results: boolean[] = [];

      const { result } = renderHook(() => {
        const query = useQuery({
          initialLoadingState: true,
        });

        results.push(query.$state.isLoading);

        query.time;

        return query.$state.isLoading;
      });

      await waitFor(() => expect(result.current).toBe(false));

      expect(results).toMatchObject([true, true, false]);
    });
  });

  test('should fetch without suspense', async () => {
    const { useQuery } = await createReactTestClient();

    const { result } = renderHook(() => {
      const query = useQuery({ suspense: false });

      return {
        hello: query.hello,
        $state: query.$state,
      };
    });

    expect(result.current.hello).toBe(undefined);

    await waitFor(() => expect(result.current.hello).toBe('hello world'));
  });

  test('should $refetch', async () => {
    const { useQuery } = await createReactTestClient();

    const { result } = renderHook(() => {
      const query = useQuery({ suspense: false });

      return {
        time: query.time,
        $state: query.$state,
        $refetch: query.$refetch,
      };
    });

    expect(result.current.time).toBe(undefined);

    await waitFor(() => expect(result.current.time).not.toBeUndefined());

    const time = result.current.time;

    await act(async () => {
      await result.current.$refetch();
      await new Promise((r) => setTimeout(r, 500));
    });

    await waitFor(() => expect(result.current.time).not.toBe(time));
  });

  it('should fetch with suspense', async () => {
    const { useQuery } = await createReactTestClient();

    const { result } = renderHook(() => useQuery({ suspense: true }).hello);

    expect(result.current).toBe(undefined);

    await waitFor(() => expect(result.current).toStrictEqual('hello world'));
  });

  it('should pass extentions to query fetcher', async () => {
    const fetchHistory: QueryPayload[] = [];
    const { useQuery } = await createReactTestClient(
      undefined,
      async (payload) => {
        fetchHistory.push(payload);
        return {};
      }
    );

    renderHook(() => {
      const query = useQuery({
        extensions: { foo: 'bar' },
      });

      return query.hello;
    });

    await waitFor(() =>
      expect(fetchHistory).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({
            extensions: expect.objectContaining({ foo: 'bar' }),
          }),
        ])
      )
    );
  });

  it('should not retain previous query inputs on state change #1594', async () => {
    const fetches: QueryPayload[] = [];
    const reactClient = await createReactTestClient(
      undefined,
      ({ query, variables, operationName }) => {
        // Keep fetch logs for result matching
        fetches.push({ query, variables, operationName });

        return reactClient.client.query(query, { variables, operationName });
      }
    );

    const { result, rerender } = renderHook(
      ({ name }) => {
        const query = reactClient.useQuery({ suspense: false });

        return query.human({ name }).name;
      },
      { initialProps: { name: '1' } }
    );

    await waitFor(() => {
      expect(result.current).toBe('1');
    });

    rerender({ name: '2' });

    await waitFor(() => {
      expect(result.current).toBe('2');
    });

    expect(fetches).toMatchInlineSnapshot(`
      [
        {
          "operationName": undefined,
          "query": "query($a00425:String){a2c936:human(name:$a00425){__typename id name}}",
          "variables": {
            "a00425": "1",
          },
        },
        {
          "operationName": undefined,
          "query": "query($dd0895:String){a657eb:human(name:$dd0895){__typename id name}}",
          "variables": {
            "dd0895": "2",
          },
        },
      ]
    `);
  });

  it('should stop retrying when maxReties are reached.', async () => {
    const fetchHistory: QueryPayload[] = [];
    const { useQuery } = await createReactTestClient(
      undefined,
      async (payload) => {
        fetchHistory.push(payload);
        throw new Error('Network error');
      }
    );
    const onError = jest.fn();

    const { result, rerender } = renderHook(() => {
      const query = useQuery({
        retry: {
          maxRetries: 2,
          retryDelay: 0,
        },
        onError,
      });

      query.hello;

      return query;
    });

    await waitFor(() => {
      expect(result.current.$state.error).not.toBeUndefined();
    });

    act(() => {
      rerender();
    });

    await waitFor(() => {
      expect(result.current.$state.error).not.toBeUndefined();
    });

    expect(result.current.$state.error).toMatchInlineSnapshot(
      `[GQtyError: Network error]`
    );

    expect(fetchHistory.length).toBe(3);
    expect(onError).toHaveBeenCalled();
  });

  it('should respect cachePolicy', async () => {
    const fetches: QueryPayload[] = [];
    const reactClient = await createReactTestClient(
      undefined,
      ({ query, variables, operationName }) => {
        // Keep fetch logs for result matching
        fetches.push({ query, variables, operationName });

        return reactClient.client.query(query, { variables, operationName });
      },
      undefined,
      {
        cache: new Cache(undefined, {
          maxAge: Infinity,
          staleWhileRevalidate: Infinity,
        }),
      }
    );

    const { result, rerender } = renderHook(() => {
      const queryWithCache = reactClient.useQuery();
      const queryWithoutCache = reactClient.useQuery({
        cachePolicy: 'no-cache',
      });

      queryWithCache.hello;
      queryWithoutCache.hello;

      return {
        queryWithCache,
        queryWithoutCache,
      };
    });

    await waitFor(() => {
      expect(result.current.queryWithCache.hello).toBe('hello world');
      expect(result.current.queryWithoutCache.hello).toBe('hello world');
    });

    expect(fetches.length).toBe(1);

    await new Promise((r) => setTimeout(r, 120));

    act(rerender);

    await waitFor(() => {
      expect(fetches.length).toBe(2);
    });

    await new Promise((r) => setTimeout(r, 120));

    act(rerender);

    await waitFor(() => {
      expect(fetches.length).toBe(3);
    });
  });

  it('should retain sub-selections for nulls and empty arrays', async () => {
    const queries: string[] = [];
    const cache = new Cache(undefined, {
      maxAge: 0,
      staleWhileRevalidate: 5 * 30 * 1000,
    });
    const { useQuery } = await createMockReactClient({
      cache,
      onFetch: ({ query }) => {
        queries.push(query);
      },
    });

    const { result } = renderHook(() => {
      const query = useQuery({
        initialLoadingState: true,
      });

      // Empty array
      query.peoples.map((people) => people.name);

      // Null
      query.pet({ id: '999' })?.owner?.name;

      query.now;

      return query;
    });

    await waitFor(() => expect(result.current.$state.isLoading).toBe(false));

    // This should NOT trigger a SWR refetch
    await act(() => result.current.$refetch(false));

    expect(queries).toMatchInlineSnapshot(`
      [
        "query($a2a039:ID!){eb2884:pet(id:$a2a039){__typename id owner{__typename id name}}now peoples{__typename id name}}",
      ]
    `);

    // Wait for the minimum leeway of 100ms
    await sleep(150);

    // This should trigger a SWR refetch
    await act(() => result.current.$refetch(false));

    expect(queries).toMatchInlineSnapshot(`
      [
        "query($a2a039:ID!){eb2884:pet(id:$a2a039){__typename id owner{__typename id name}}now peoples{__typename id name}}",
        "query($a2a039:ID!){eb2884:pet(id:$a2a039){__typename id owner{__typename id name}}now peoples{__typename id name}}",
      ]
    `);
  });
});
