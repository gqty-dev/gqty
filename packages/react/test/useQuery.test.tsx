import { act, renderHook, waitFor } from '@testing-library/react';
import { type QueryPayload } from 'gqty';
import { createReactTestClient } from './utils';

describe('useQuery', () => {
  fdescribe('isLoading', () => {
    fit('should respect initial loading state', async () => {
      const { useQuery } = await createReactTestClient();

      const results: boolean[] = [];

      const { result } = renderHook(() => {
        const query = useQuery({
          initialLoadingState: true,
          cachePolicy: 'no-cache',
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
});
