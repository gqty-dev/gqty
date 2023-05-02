import { $meta } from 'gqty/Accessor';
import { Cache, GQtyError, QueryPayload, prepass } from '../src';
import { fetchSelections } from '../src/Client/resolveSelections';
import { updateCaches } from '../src/Client/updateCaches';
import { Selection } from '../src/Selection';
import { createTestClient } from './utils';

describe('core#resolve', () => {
  describe('fetchPolicy', () => {
    it('default', async () => {
      const {
        resolve,
        schema: { query },
      } = await createTestClient(undefined, undefined, undefined, {
        cache: new Cache(undefined, { maxAge: 50 }),
      });

      await expect(
        resolve(({ query }) => query.nFetchCalls, { cachePolicy: 'default' })
      ).resolves.toBe(1);

      await expect(
        resolve(({ query }) => query.nFetchCalls, { cachePolicy: 'default' })
      ).resolves.toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 150));

      let promise: Promise<unknown> | undefined;
      resolve(({ query }) => query.nFetchCalls, {
        awaitsFetch: false,
        cachePolicy: 'default',
        onFetch(p) {
          promise = p;
        },
      });
      expect(query.nFetchCalls).toBe(1);
      await promise;
      expect(query.nFetchCalls).toBe(2);
    });

    it('force-cache', async () => {
      const {
        resolve,
        schema: { query },
      } = await createTestClient(undefined, undefined, undefined, {
        cache: new Cache(undefined, { maxAge: 50, staleWhileRevalidate: 0 }),
      });

      await expect(
        resolve(
          ({ query }) => {
            query.nFetchCalls;
            return query.hello;
          },
          { cachePolicy: 'default' }
        )
      ).resolves.toBe('hello world');
      expect(query.nFetchCalls).toBe(1);

      await expect(
        resolve(
          ({ query }) => {
            query.nFetchCalls;
            return query.hello;
          },
          { cachePolicy: 'force-cache' }
        )
      ).resolves.toBe('hello world');
      expect(query.nFetchCalls).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(query.hello).toBe('hello world');
      await expect(
        resolve(
          ({ query }) => {
            query.nFetchCalls;
            return query.hello;
          },
          { cachePolicy: 'force-cache' }
        )
      ).resolves.toBe('hello world');
      expect(query.nFetchCalls).toBe(2);
    });

    it('no-cache', async () => {
      const { resolve } = await createTestClient(
        undefined,
        undefined,
        undefined,
        {
          cache: new Cache(undefined, {
            maxAge: Infinity,
            staleWhileRevalidate: 0,
          }),
        }
      );

      await expect(
        resolve(({ query }) => query.nFetchCalls, { cachePolicy: 'default' })
      ).resolves.toBe(1);

      await expect(
        resolve(({ query }) => query.nFetchCalls, { cachePolicy: 'no-cache' })
      ).resolves.toBe(2);

      await expect(
        resolve(({ query }) => query.nFetchCalls, { cachePolicy: 'default' })
      ).resolves.toBe(2);
    });

    it('no-store', async () => {
      const {
        resolve,
        schema: { query },
      } = await createTestClient(undefined, undefined, undefined, {
        cache: new Cache(undefined, {
          maxAge: Infinity,
          staleWhileRevalidate: 0,
        }),
      });

      await expect(
        resolve(({ query }) => query.hello, { cachePolicy: 'no-store' })
      ).resolves.toBe('hello world');

      expect(query.hello).toBeUndefined();
    });

    /**
     * When multiple tests are running, GC gets triggered more often and this
     * randomly fails. Should work when run individually.
     */
    xit('only-if-cached', async () => {
      const { resolve } = await createTestClient(
        undefined,
        undefined,
        undefined,
        {
          cache: new Cache(undefined, {
            maxAge: 0,
            staleWhileRevalidate: 0,
          }),
        }
      );

      await expect(() =>
        resolve(({ query }) => query.hello, { cachePolicy: 'only-if-cached' })
      ).rejects.toThrowError(new TypeError('Failed to fetch'));

      await expect(resolve(({ query }) => query.hello)).resolves.toBe(
        'hello world'
      );

      await expect(
        resolve(({ query }) => query.hello, { cachePolicy: 'only-if-cached' })
      ).resolves.toBe('hello world');
    });
  });

  it('subscriptions', async () => {
    const { resolve } = await createTestClient(undefined, undefined, {
      subscriptions: true,
    });

    const subPromise = resolve(
      ({ subscription }) => subscription.newNotification
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    await resolve(({ mutation }) =>
      mutation.sendNotification({ message: 'hello world' })
    );

    const data = await subPromise;

    expect(data).toEqual('hello world');
  });

  it('handles errors', async () => {
    const { resolve } = await createTestClient();

    try {
      await resolve(({ query }) => {
        query.throw;
        query.throw2;
      });
    } catch (error) {
      expect(error).toEqual(
        Object.assign(
          Error('GraphQL Errors, please check .graphQLErrors property'),
          {
            errors: [
              {
                message: 'expected error',
                locations: [{ line: 1, column: 7 }],
                path: ['throw'],
              },
              {
                message: 'expected error 2',
                locations: [{ line: 1, column: 13 }],
                path: ['throw2'],
              },
            ],
          }
        )
      );
    }
  });

  it('passes on query extensions', async () => {
    const fetchHistory: QueryPayload[] = [];
    const { resolve } = await createTestClient(undefined, (payload) => {
      fetchHistory.push(payload);
      return {};
    });

    await resolve(({ query }) => query.hello, { extensions: { foo: 'bar' } });

    expect(fetchHistory[0].extensions).toMatchObject({ foo: 'bar' });
  });
});

describe('compat', () => {
  test('resolved', async () => {
    const { query, resolved } = await createTestClient();

    expect(typeof query).toBe('object');

    await resolved(() => {
      return query.hello;
    }).then((value) => {
      expect(value).toBe('hello world');
    });
  });

  test('resolved with onCacheData', async () => {
    const { query, resolved } = await createTestClient();

    expect(typeof query).toBe('object');

    await expect(resolved(() => query.hello)).resolves.toBe('hello world');

    const onCacheData = jest
      .fn()
      .mockImplementation((data: string): boolean => {
        expect(data).toBe('hello world');

        return true;
      });

    await expect(
      resolved(() => query.hello, { refetch: true, onCacheData })
    ).resolves.toBe('hello world');

    expect(onCacheData).toBeCalledTimes(1);

    const onCacheData2 = jest
      .fn()
      .mockImplementation((data: string): boolean => {
        expect(data).toBe('hello world');

        return false;
      });

    await expect(
      resolved(() => query.hello, { refetch: true, onCacheData: onCacheData2 })
    ).resolves.toBe('hello world');

    expect(onCacheData2).toBeCalledTimes(1);
  });

  test('resolved with operationName', async () => {
    const fetchHistory: string[] = [];
    const { query, resolved } = await createTestClient(
      undefined,
      async ({ query }) => {
        fetchHistory.push(query);
        return {};
      }
    );

    await Promise.all([
      resolved(() => query.hello, { operationName: 'TestQueryA' }),
      resolved(() => query.hello, { operationName: 'TestQueryB' }),
    ]);

    expect(fetchHistory).toEqual(
      expect.arrayContaining([
        'query TestQueryA{hello}',
        'query TestQueryB{hello}',
      ])
    );
  });

  test('resolved with unions', async () => {
    const { query, resolved, queries } = await createTestClient();

    await Promise.all([
      resolved(() => {
        return prepass(query.union({ type: 'A' }).$on, 'A.a', 'B.b');
      }),
    ]);

    expect(queries).toMatchObject(
      expect.arrayContaining([
        expect.objectContaining({
          query: expect.stringContaining('...on A{a id}...on B{b id}'),
        }),
      ])
    );
  });

  test('inlineResolved with operationName', async () => {
    const { query, mutation, inlineResolved, queries } =
      await createTestClient();

    await Promise.all([
      inlineResolved(() => query.human({ name: 'John' }).__typename, {
        operationName: 'TestQueryA',
      }),
      inlineResolved(
        () => mutation.humanMutation({ nameArg: 'Jane' }).__typename,
        { operationName: 'TestMutation' }
      ),
      inlineResolved(() => query.hello, {
        operationName: 'TestQueryB',
      }),
    ]);

    expect(queries.map(({ query }) => query)).toMatchInlineSnapshot(`
      [
        "query TestQueryA($v1:String){b434c:human(name:$v1){__typename}}",
        "mutation TestMutation($v1:String!){ff8ff:humanMutation(nameArg:$v1){__typename}}",
        "query TestQueryB{hello}",
      ]
    `);
  });

  describe('resolved cache options', () => {
    test('refetch', async () => {
      const { query, resolved } = await createTestClient(
        undefined,
        undefined,
        undefined,
        { cache: new Cache(undefined, { maxAge: Infinity }) }
      );
      const resolveFn = () => {
        const human = query.human({
          name: 'a',
        });
        return {
          name: human.name,
          nFetchCalls: query.nFetchCalls,
        };
      };

      {
        const data = await resolved(resolveFn);

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(1);
      }

      {
        const data = await resolved(resolveFn);

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(1);
      }

      {
        const data = await resolved(resolveFn, { refetch: true });

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(2);
      }
    });

    test('noCache', async () => {
      const { query, resolved } = await createTestClient(
        undefined,
        undefined,
        undefined,
        { cache: new Cache(undefined, { maxAge: Infinity }) }
      );
      const resolveFn = () => {
        const human = query.human({
          name: 'a',
        });
        return {
          name: human.name,
          nFetchCalls: query.nFetchCalls,
        };
      };

      {
        const data = await resolved(resolveFn);

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(1);
      }

      {
        const data = await resolved(resolveFn, { noCache: true });

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(2);
      }

      {
        const data = await resolved(resolveFn);

        expect(data.name).toBe('a');
        expect(data.nFetchCalls).toBe(1);
      }
    });
  });

  describe('resolved fetch options', () => {
    test('fetch options are passed to query fetcher', async () => {
      expect.assertions(2);

      const { resolved, query } = await createTestClient(
        undefined,
        async ({ query, variables }, fetchOptions) => {
          expect({ query, variables, fetchOptions }).toStrictEqual({
            fetchOptions: {
              mode: 'cors',
              credentials: 'include',
            },
            query: 'query{hello}',
            variables: undefined,
          });
          return {
            data: {
              hello: 'Hello World',
            },
          };
        }
      );

      expect(
        await resolved(
          () => {
            return query.hello;
          },
          {
            fetchOptions: {
              mode: 'cors',
              credentials: 'include',
            },
          }
        )
      ).toBe('Hello World');
    });
  });

  describe('error handling', () => {
    test('resolved single throws', async () => {
      const { query, resolved } = await createTestClient();

      await resolved(
        () => {
          query.throw;
        },
        {
          retry: false,
        }
      )
        .then(() => {
          throw Error("Shouldn't reach here");
        })
        .catch((err) => {
          if (!(err instanceof Error)) throw Error('Incompatible error type');

          expect(err).toEqual(
            Object.assign(Error('expected error'), {
              locations: [{ line: 1, column: 7 }],
              path: ['throw'],
            })
          );
        });
    });

    test('resolved multiple throws, with shorter error for production', async () => {
      const { query, resolved } = await createTestClient();

      const prevProcessEnv = process.env.NODE_ENV;

      try {
        await resolved(
          () => {
            query.throw;
            query.throw2;
          },
          {
            retry: false,
          }
        )
          .then(() => {
            throw Error("Shouldn't reach here");
          })
          .catch((err) => {
            if (!(err instanceof Error)) throw Error('Incompatible error type');

            expect(err).toEqual(
              Object.assign(
                Error('GraphQL Errors, please check .graphQLErrors property'),
                {
                  errors: [
                    {
                      message: 'expected error',
                      locations: [{ line: 1, column: 7 }],
                      path: ['throw'],
                    },
                    {
                      message: 'expected error 2',
                      locations: [{ line: 1, column: 13 }],
                      path: ['throw2'],
                    },
                  ],
                }
              )
            );
          });

        process.env.NODE_ENV = 'production';

        await resolved(
          () => {
            query.throw;
            query.throw2;
          },
          {
            noCache: true,
            retry: false,
          }
        )
          .then(() => {
            throw Error("Shouldn't reach here");
          })
          .catch((err) => {
            if (!(err instanceof Error)) throw Error('Incompatible error type');

            expect(err).toEqual(
              Object.assign(Error('GraphQL Errors'), {
                errors: [
                  {
                    message: 'expected error',
                    locations: [{ line: 1, column: 7 }],
                    path: ['throw'],
                  },
                  {
                    message: 'expected error 2',
                    locations: [{ line: 1, column: 13 }],
                    path: ['throw2'],
                  },
                ],
              })
            );
          });
      } finally {
        process.env.NODE_ENV = prevProcessEnv;
      }
    });

    test('network error', async () => {
      const { query, resolved } = await createTestClient(undefined, () => {
        throw Error('expected network error');
      });

      try {
        await resolved(() => query.hello);

        throw Error("shouldn't reach here");
      } catch (err: any) {
        expect(err.message).toBe('expected network error');
      }
    });

    test('unexpected network error type', async () => {
      const { query, resolved } = await createTestClient(undefined, () => {
        throw 12345;
      });

      try {
        await resolved(() => query.hello);

        throw Error("shouldn't reach here");
      } catch (err) {
        expect(err).toStrictEqual(GQtyError.create(12345));
      }
    });
  });

  describe('mutation', () => {
    test('mutation usage', async () => {
      const { mutation, resolved } = await createTestClient();

      const data = await resolved(() => {
        return mutation.sendNotification({
          message: 'hello world',
        });
      });

      expect(data).toBe(true);
    });
  });

  describe('custom query fetcher', () => {
    test('empty data', async () => {
      const { query, resolved } = await createTestClient(
        undefined,
        async (_query, _variables) => ({})
      );

      const data = await resolved(() => {
        return query.hello;
      });
      expect(data).toBe(undefined);
    });
  });

  describe('fetchSelections', () => {
    test('works with included cache', async () => {
      const {
        schema: { query },
      } = await createTestClient();

      const cache = $meta(query)?.context.cache!;

      await fetchSelections(
        new Set([Selection.createRoot('query').getChild('hello')]),
        {
          cache,
          fetchOptions: {
            fetcher: async () => ({ data: { hello: 'hello world' } }),
          },
        }
      ).then((results) => {
        updateCaches(results, [cache], { skipNotify: false });
      });

      expect(cache.toJSON()).toMatchObject({
        query: {
          hello: 'hello world',
        },
      });
    });
  });
});

process.on('beforeExit', () => {
  console.log('CLIENT TEST EXIT');
});
