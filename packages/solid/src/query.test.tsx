/**
 * Defining jsxImportSource in tsconfig.json is not enough to prevent
 * bob-esbuild from resolving *.test.tsx with react, and we cannot remove
 * bob-esbuild before the esbuild options to produce a result as clean as those
 * published to NPM, e.g. without CommonJS polyfills.
 *
 * Vitest produce the following warning since 3.0, which is irrelevant to
 * solid-js:
 * The JSX import source cannot be set without also enabling React's "automatic"
 * JSX transform
 */
/** @jsxImportSource solid-js */

import { render, testEffect, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { Cache, GQtyError, type QueryPayload } from 'gqty';
import { createEffect, createSignal, ErrorBoundary, Suspense } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createMockSolidClient } from '../test/client';

const user = userEvent.setup();

describe('createQuery', () => {
  it('should query with and without SWR', async () => {
    const queries: string[] = [];
    const { createQuery } = await createMockSolidClient({
      client: {
        cache: new Cache(undefined, {
          maxAge: 0,
          staleWhileRevalidate: 5 * 30 * 1000,
        }),
        onFetch: ({ query }) => {
          queries.push(query);
        },
      },
    });

    await testEffect((done) => {
      const query = createQuery();

      let lastValue: string | undefined;

      createEffect((run: number = 0) => {
        const value = query().now;

        switch (run) {
          case 0:
            expect(query.$state.loading).toBe(false);
            expect(value).toBeUndefined();
            break;
          case 1:
            expect(query.$state.loading).toBe(true);
            expect(value).toBeUndefined();
            break;
          case 2:
            expect(query.$state.loading).toBe(false);
            expect(value).toStrictEqual(
              expect.stringMatching(
                new RegExp(`^${new Date().toISOString().slice(0, 10)}`)
              )
            );

            lastValue = value;

            // Test soft refetch with valid cache (no SWR)
            setTimeout(() => {
              query.$refetch(false);
              expect(query.$state.loading).toBe(false);
            });

            // Test soft refetch with SWR
            setTimeout(() => {
              query.$refetch(false);
            }, 120);
            break;
          case 3:
            expect(query.$state.loading).toBe(true);
            expect(value).toStrictEqual(lastValue);
            break;
          case 4:
            expect(query.$state.loading).toBe(false);
            expect(value).not.toStrictEqual(lastValue);

            lastValue = value;

            query.$refetch(true);
            break;
          case 5:
            expect(query.$state.loading).toBe(true);
            expect(value).toStrictEqual(lastValue);
            break;
          case 6:
            expect(query.$state.loading).toBe(false);
            expect(value).not.toStrictEqual(lastValue);
            expect(queries).toMatchInlineSnapshot(`
              [
                "query{now}",
                "query{now}",
                "query{now}",
              ]
            `);

            done();
            break;
        }

        return run + 1;
      });
    });
  });

  it('should fetch without stale inputs', async () => {
    const queries: QueryPayload[] = [];
    const { createQuery } = await createMockSolidClient({
      client: {
        onFetch: (payload) => {
          queries.push(payload);
        },
        mockData: {
          peoples: {
            '1': { id: '1', name: 'Alice', pets: [] },
            '2': { id: '2', name: 'Bob', pets: [] },
            '3': { id: '3', name: 'Charlie', pets: [] },
          },
        },
      },
    });

    await testEffect((done) => {
      const query = createQuery();
      const [id, setId] = createSignal('1');

      let run = 0;
      createEffect(() => {
        const value = query().people({ id: id() })?.name;

        switch (run++) {
          case 0:
            expect(query.$state.loading).toBe(false);
            expect(value).toBeUndefined();
            break;
          case 1:
            expect(query.$state.loading).toBe(true);
            expect(value).toBeUndefined();
            break;
          case 2:
            expect(query.$state.loading).toBe(false);
            expect(value).toBe('Alice');

            // Update asynchronously would be a more accurate way to represent
            // user-triggered events, it also gives internal fetch promises a
            // chance clear stale selections.
            setTimeout(() => setId('2'));
            break;
          case 3:
            expect(query.$state.loading).toBe(false);
            break;
          case 4:
            expect(query.$state.loading).toBe(true);
            break;
          case 5:
            expect(query.$state.loading).toBe(false);
            expect(value).toBe('Bob');

            // This shouldn't trigger a fetch
            setTimeout(() => setId('1'));
            break;
          case 6:
            expect(query.$state.loading).toBe(false);
            expect(value).toBe('Alice');

            setTimeout(() => setId('3'));
            break;
          case 7:
            expect(query.$state.loading).toBe(false);
            break;
          case 8:
            expect(query.$state.loading).toBe(true);
            break;
          case 9:
            expect(query.$state.loading).toBe(false);
            expect(value).toBe('Charlie');
            expect(queries).toMatchInlineSnapshot(`
              [
                {
                  "operationName": undefined,
                  "query": "query($e61a8e:ID!){a02d2c:people(id:$e61a8e){__typename id name}}",
                  "variables": {
                    "e61a8e": "1",
                  },
                },
                {
                  "operationName": undefined,
                  "query": "query($d6d931:ID!){e084c7:people(id:$d6d931){__typename id name}}",
                  "variables": {
                    "d6d931": "2",
                  },
                },
                {
                  "operationName": undefined,
                  "query": "query($a60dd8:ID!){d2f785:people(id:$a60dd8){__typename id name}}",
                  "variables": {
                    "a60dd8": "3",
                  },
                },
              ]
            `);
            done();
            break;
        }
      });
    });
  });

  it.skip('should respect cachePolicy', async () => {
    const { createQuery } = await createMockSolidClient({
      client: {
        onFetch: ({ query }) => console.log(query),
        cache: new Cache(undefined, {
          maxAge: Infinity,
        }),
      },
    });
    const { getByTestId, getByText } = render(() => {
      const queryCached = createQuery({
        cachePolicy: 'default',
      });
      const queryUncached = createQuery({
        cachePolicy: 'no-cache',
      });

      return (
        <Suspense fallback="loading">
          <div data-testid="cached">{queryCached().now}</div>
          <div data-testid="uncached">{queryUncached().now}</div>
          <button
            data-testid="refetchCached"
            onClick={() => queryCached.$refetch(false)}
          />
          <button
            data-testid="refetchUncached"
            onClick={() => queryUncached.$refetch(false)}
          />
        </Suspense>
      );
    });

    await waitFor(() => getByText('loading'));

    const currentYear = new Date().getFullYear();

    let lastCachedValue = '';
    let lastUncachedValue = '';

    await waitFor(() => {
      const cached = getByTestId('cached');
      expect(cached).toHaveTextContent(new RegExp(`^${currentYear}`));
      lastCachedValue = cached.textContent!;

      const uncached = getByTestId('uncached');
      expect(uncached).toHaveTextContent(new RegExp(`^${currentYear}`));
      lastUncachedValue = uncached.textContent!;
    });

    // await new Promise((r) => setTimeout(r, 100));

    console.log('clicking refetchCached');
    await user.click(getByTestId('refetchCached'));

    // await new Promise((r) => setTimeout(r, 100));

    await waitFor(() => {
      const cached = getByTestId('cached');
      expect(cached).toHaveTextContent(lastCachedValue);
    });

    console.log('clicking refetchUncached');
    await user.click(getByTestId('refetchUncached'));

    await waitFor(() => {
      const uncached = getByTestId('uncached');
      expect(uncached).not.toHaveTextContent(lastUncachedValue);
    });
  });

  it.todo('should handles input changes during fetch');

  it('should throw query errors', async () => {
    const { createQuery } = await createMockSolidClient({
      client: {
        onFetch: () => {
          throw new GQtyError('Test error');
        },
      },
    });

    const ErrorComponent = () => {
      const query = createQuery();

      return <>{query().now}</>;
    };

    const consoleMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { getByText } = render(() => {
      return (
        <div data-testid="container">
          <ErrorBoundary fallback={() => <>error boundary</>}>
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      );
    });

    await waitFor(() => getByText('error boundary'));

    consoleMock.mockRestore();
  });

  it('should stay reactive for mutations', async () => {
    const cache = new Cache(undefined, {
      normalization: true,
    });
    const { createQuery, createMutation } = await createMockSolidClient({
      client: {
        cache,
        mockData: {
          dogs: { '1': { id: '1', name: 'Fido' } },
        },
      },
    });

    const { getByText } = render(() => {
      const query = createQuery();
      const rename = createMutation((mutation, name: string) => {
        const dog = mutation.renameDog({ id: '1', name });

        return { ...dog };
      });

      return (
        <button
          onClick={async () => {
            await rename('Rex');
          }}
        >
          {query().pet({ id: '1' })?.$on.Dog?.name}
        </button>
      );
    });

    await waitFor(() => getByText('Fido'));

    await user.click(getByText('Fido'));

    await waitFor(() => getByText('Rex'));
  });

  it('should refetch on reconnect', async () => {
    let online = true;
    const { navigator, window } = globalThis;
    const navigatorMock = vi
      .spyOn(navigator, 'onLine', 'get')
      .mockImplementation(() => online);
    const setOnline = (value: boolean) => {
      online = value;
      window.dispatchEvent(new Event(value ? 'online' : 'offline'));
    };
    const { createQuery } = await createMockSolidClient({
      client: {
        cache: new Cache(undefined, {
          maxAge: 0,
          staleWhileRevalidate: 5 * 30 * 1000,
        }),
      },
    });

    await testEffect((done) => {
      const query = createQuery({ refetchOnReconnect: true });

      let lastValue: string | undefined;

      createEffect((run: number = 0) => {
        const now = query().now;

        switch (run) {
          case 0:
            expect(query.$state.loading).toBe(false);
            expect(now).toBeUndefined();
            break;
          case 1:
            expect(query.$state.loading).toBe(true);
            expect(now).toBeUndefined();
            break;
          case 2:
            expect(query.$state.loading).toBe(false);
            expect(now).not.toBeUndefined();

            lastValue = now;

            setTimeout(() => {
              setOnline(false);
              setOnline(true);
            }, 120);
            break;
          case 3:
            expect(query.$state.loading).toBe(true);
            break;
          case 4:
            expect(query.$state.loading).toBe(false);
            expect(now).not.toBe(lastValue);
            done();
            break;
        }

        return run + 1;
      });
    });

    navigatorMock.mockRestore();
  });

  it('should refetch on window visible', async () => {
    let visible = true;
    const { document } = globalThis;
    const documentMock = vi
      .spyOn(document, 'hidden', 'get')
      .mockImplementation(() => !visible);
    const setVisibility = (value: boolean) => {
      visible = value;
      document.dispatchEvent(new Event('visibilitychange'));
    };
    const { createQuery } = await createMockSolidClient({
      client: {
        cache: new Cache(undefined, {
          maxAge: 0,
          staleWhileRevalidate: 5 * 30 * 1000,
        }),
      },
    });

    await testEffect((done) => {
      const query = createQuery({ refetchOnWindowVisible: true });

      let lastValue: string | undefined;

      createEffect((run: number = 0) => {
        const now = query().now;

        switch (run) {
          case 0:
            expect(query.$state.loading).toBe(false);
            expect(now).toBeUndefined();
            break;
          case 1:
            expect(query.$state.loading).toBe(true);
            expect(now).toBeUndefined();
            break;
          case 2:
            expect(query.$state.loading).toBe(false);
            expect(now).not.toBeUndefined();

            lastValue = now;

            setTimeout(() => {
              setVisibility(false);
              setVisibility(true);
            }, 120);
            break;
          case 3:
            expect(query.$state.loading).toBe(true);
            break;
          case 4:
            expect(query.$state.loading).toBe(false);
            expect(now).not.toBe(lastValue);
            done();
            break;
        }

        return run + 1;
      });
    });

    documentMock.mockRestore();
  });
});
