import { getArrayFields, GQtyError } from '../src';
import { $meta, assignSelections, setCache } from '../src/Accessor';
import { createTestClient, Dog, expectConsoleWarn } from './utils';

test('legacy warning', async () => {
  const { query } = await createTestClient();

  expectConsoleWarn((n, message) => {
    switch (n) {
      case 1:
        return expect(message).toMatchInlineSnapshot(
          `"[GQty] global query, mutation and subscription is deprecated, please see the migration guide for scoped query."`
        );
      default:
        throw Error('Unexpected warn: ' + message);
    }
  });

  query.hello;
});

describe('array accessors', () => {
  test('array query', async () => {
    expectConsoleWarn((n, message) => {
      switch (n) {
        case 1:
          return expect(message).toMatchInlineSnapshot(
            `"[gqty] Warning! No data requested."`
          );
        default:
          throw Error('Unexpected warn: ' + message);
      }
    });

    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      const human = query.human();
      return human.sons.map((son) => {
        return son.name;
      });
    });

    expect(data).toEqual(['default', 'default']);

    const cachedDataHumanOutOfSize = await resolved(() => {
      const human = query.human();
      return human.sons[2];
    });

    expect(cachedDataHumanOutOfSize).toBe(undefined);
  });

  test('null cache object array', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return query.nullArray?.map((v) => v?.name) ?? null;
    });

    expect(data).toBe(null);

    expect(query.nullArray).toBe(null);
  });

  test('null cache scalar array', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return query.nullStringArray?.map((v) => v) ?? null;
    });

    expect(data).toBe(null);

    expect(query.nullStringArray).toBe(null);
  });
});

describe('accessor undefined paths', () => {
  test('undefined object path', async () => {
    const { query } = await createTestClient();

    //@ts-expect-error
    const shouldBeUndefined = query.other;

    expect(shouldBeUndefined).toBe(undefined);
  });

  test('intentionally manipulated schema', async () => {
    expectConsoleWarn((n, message) => {
      switch (n) {
        case 1:
          return expect(message).toMatchInlineSnapshot(
            `"[gqty] Warning! No data requested."`
          );
        default:
          throw Error('Unexpected warn: ' + message);
      }
    });

    const { query, resolved } = await createTestClient({
      query: {
        other: {
          __type: 'error',
        },
      },
      wrongroot: false as any,
    });

    await expect(() =>
      resolved(
        () =>
          // @ts-expect-error
          query.other
      )
    ).rejects.toEqual(new GQtyError(`GraphQL type not found: error`));

    await expect(
      resolved(
        () =>
          // @ts-expect-error
          query.wrongRoot
      )
    ).resolves.toBe(undefined);
  });
});

describe('setCache', () => {
  test('expected functionality', async () => {
    const {
      schema: { query, mutation },
      resolve,
    } = await createTestClient();

    {
      expect(query.human({ name: 'aaa' }).name).toBe(undefined);

      await resolve(({ query }) => {
        query.human({ name: 'aaa' }).name;
      });
      expect(query.human({ name: 'aaa' }).name).toBe('aaa');
    }

    {
      expect(mutation.humanMutation({ nameArg: 'bbb' }).name).toBe(undefined);

      await resolve(({ mutation }) => {
        mutation.humanMutation({ nameArg: 'bbb' }).name;
      });
      expect(mutation.humanMutation({ nameArg: 'bbb' }).name).toBe('bbb');
    }

    {
      const humanQuery = query.human({ name: 'aaa' });
      const humanMutation = mutation.humanMutation({ nameArg: 'bbb' });

      Object.assign(humanQuery, humanMutation);
      expect(humanQuery.name).toBe('bbb');

      humanQuery.name = 'ccc';
      expect(humanQuery.name).toBe('ccc');

      $meta(humanQuery)!.cache.data = {};
      Object.assign(humanQuery, query.human({ name: 'nnn' }));
      expect(humanQuery.name).toBe(undefined);
    }

    {
      await resolve(
        ({ query }) => {
          query.human({ name: 'aaa' }).name;
        },
        { cachePolicy: 'no-cache' }
      );

      const humanQuery = query.human({ name: 'aaa' });
      expect(humanQuery.name).toBe('aaa');

      humanQuery.sons[0] = { ...humanQuery };
      expect(humanQuery.sons[0].name).toBe('aaa');

      humanQuery.name = 'bbb';
      expect(query.human({ name: 'aaa' }).name).toBe('bbb');

      humanQuery.sons[0].name = 'ccc';

      expect(humanQuery.sons[0].name).toBe('ccc');
      expect(humanQuery.name).toBe('bbb');

      Object.assign(query.human({ name: 'hhh' }), { name: 'nnn' });
      expect(query.human({ name: 'hhh' }).name).toBe('nnn');

      query.human().name = 'zzz';
      query.human().name = 'zzz';

      query.human().name = 'zzz';

      expect(query.human().name).toBe('zzz');
    }
  });

  test('with listeners', async () => {
    const {
      schema: { query },
      subscribeLegacySelections: subscribeSelections,
    } = await createTestClient();

    {
      const selections: Array<[string, any]> = [];
      const mockedFn = jest.fn((selection, cache) => {
        selections.push([selection.cacheKeys.join('.'), cache?.data]);
      });

      const unsubscribe = subscribeSelections(mockedFn);

      query.hello = '12345';

      unsubscribe();

      expect(query.hello).toBe('12345');
      expect(mockedFn).toBeCalledTimes(1);
      expect(selections).toMatchInlineSnapshot(`
        [
          [
            "query.hello",
            "12345",
          ],
        ]
      `);
      expect(query).toMatchInlineSnapshot(`
        {
          "__typename": "Query",
          "hello": "12345",
        }
      `);
    }

    {
      const selections: Array<[string, any]> = [];
      const mockedFn = jest.fn((selection, cache) => {
        selections.push([selection.cacheKeys.join('.'), cache?.data]);
      });

      const unsubscribe = subscribeSelections(mockedFn);

      Object.assign(query, { hello: '6789' });

      unsubscribe();

      expect(mockedFn).toBeCalledTimes(1);
      expect(selections).toMatchInlineSnapshot(`
        [
          [
            "query.hello",
            "6789",
          ],
        ]
      `);
      expect(query.hello).toBe('6789');
      expect(query).toMatchInlineSnapshot(`
        {
          "__typename": "Query",
          "hello": "6789",
        }
      `);
    }
  });

  test('validation', async () => {
    const {
      schema: { query },
    } = await createTestClient();

    expect(() => {
      // @ts-expect-error
      setCache((_args?: { a: string }) => {}, undefined);
    }).toThrowError('Subject must be an accessor.');

    expect(() => {
      setCache(query, (() => {}) as any);
    }).toThrowError(
      'Data must be a subset of the schema object, got type: ' + 'function'
    );

    expect(() => {
      setCache(query, 123123 as any);
    }).toThrowError(
      'Data must be a subset of the schema object, got type: ' + 'number'
    );

    expect(() => {
      setCache({}, {});
    }).toThrowError('Subject must be an accessor.');

    expect(() => {
      // @ts-expect-error
      query.human({ name: 'ñññ' }).sons['hello'] = null;
    }).toThrowError('Invalid array assignment.');
  });
});

describe('assign selections', () => {
  test('expected usage', async () => {
    const {
      mutate,
      resolve,
      schema: { query },
    } = await createTestClient();

    await resolve(({ query }) => {
      const human = query.human({ name: 'A' });

      human.name;
      human.father.name;
      human.father.father.name;
      human.father.name;
      human.sons.map((son) => son.name);
    });

    const human = query.human({ name: 'A' });
    expect(human.name).toBe('A');
    expect(human.father.name).toBeTruthy();
    expect(human.father.father.name).toBeTruthy();
    expect(human.sons.length).toBe(2);
    expect(
      human.sons.every((son) => typeof son.name === 'string')
    ).toBeTruthy();

    const humanMutation = await mutate((mutation) => {
      const humanMutation = mutation.humanMutation({
        nameArg: 'B',
      });

      assignSelections(human, humanMutation);

      return humanMutation;
    });

    expect(humanMutation.name).toBe('B');
    expect(humanMutation.father.name).toBeTruthy();
    expect(human.father.name).toBeTruthy();
    expect(humanMutation.father.father.name).toBeTruthy();
    expect(human.father.father.name).toBeTruthy();
    expect(humanMutation.sons.length).toBe(2);
    expect(
      humanMutation.sons.every((son) => typeof son.name === 'string')
    ).toBeTruthy();
  });

  test('Source proxy without selections warn in non-production env', async () => {
    const { query } = await createTestClient();

    const human = query.human({
      name: 'L',
    });

    const spy = jest.spyOn(console, 'warn').mockImplementation((message) => {
      expect(message).toBe("Source proxy doesn't have any selections made");
    });

    assignSelections(human, human);

    expect(spy).toBeCalledTimes(1);

    const prevNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';

      assignSelections(human, human);
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
    }

    expect(spy).toBeCalledTimes(1);

    spy.mockRestore();
  });

  test('null proxies', async () => {
    const { query } = await createTestClient();

    assignSelections(query, null);
    assignSelections(null, query);
  });

  test('Invalid proxies', async () => {
    const { query } = await createTestClient();

    expect(() => {
      assignSelections({}, {});
    }).toThrowError('Invalid source proxy');

    expect(() => {
      assignSelections(query, {} as any);
    }).toThrowError('Invalid target proxy');
  });
});

describe('unions support', () => {
  test('works', async () => {
    const { query, resolved } = await createTestClient();

    await resolved(() => {
      return query.species.map((v) => {
        const onSpecies = v.$on;
        const dogName = onSpecies.Dog?.name;
        const humanName = onSpecies.Human?.name;
        return {
          __typename: v.__typename,
          name: dogName || humanName,
        };
      });
    }).then((data) => {
      expect(data).toEqual([
        {
          __typename: 'Human',
          name: 'default',
        },
        {
          __typename: 'Dog',
          name: 'a',
        },
        {
          __typename: 'Dog',
          name: 'b',
        },
      ]);
    });
  });
});

describe('mutate accessors', () => {
  test('works', async () => {
    const { query, resolved } = await createTestClient();

    Object.assign(query.human(), { name: 'hello' });

    const humanHello = query.human();

    expect(humanHello.name).toBe('hello');

    humanHello.father = humanHello;

    const newDogs: Dog[] = [
      {
        __typename: 'Dog',
        name: 'zxc',
        owner: humanHello,
      },
    ];
    humanHello.dogs = newDogs;

    expect(humanHello.dogs).toMatchInlineSnapshot(`
      [
        {
          "__typename": "Dog",
          "name": "zxc",
          "owner": {
            "dogs": [Circular],
            "father": [Circular],
            "name": "hello",
          },
        },
      ]
    `);

    const dogs = await resolved(() => {
      return getArrayFields(query.dogs, 'name');
    });

    const owner = (dogs[0].owner = {
      __typename: 'Human',
      dogs: [humanHello.dogs[0]],
      father: humanHello,
      name: 'ModifiedOwner',
      sons: [humanHello],
      node: [],
      union: [],
    });

    expect(owner).toMatchInlineSnapshot(`
      {
        "__typename": "Human",
        "dogs": [
          {
            "__typename": "Dog",
            "name": "zxc",
            "owner": {
              "dogs": [
                [Circular],
              ],
              "father": [Circular],
              "name": "hello",
            },
          },
        ],
        "father": {
          "dogs": [
            {
              "__typename": "Dog",
              "name": "zxc",
              "owner": [Circular],
            },
          ],
          "father": [Circular],
          "name": "hello",
        },
        "name": "ModifiedOwner",
        "node": [],
        "sons": [
          {
            "dogs": [
              {
                "__typename": "Dog",
                "name": "zxc",
                "owner": [Circular],
              },
            ],
            "father": [Circular],
            "name": "hello",
          },
        ],
        "union": [],
      }
    `);
  });
});
