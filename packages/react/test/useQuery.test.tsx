import { act, renderHook, waitFor } from '@testing-library/react';
import { type QueryPayload } from 'gqty';
import { createReactTestClient } from './utils';

describe('useQuery', () => {
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
});
