import {
  Cache,
  castNotSkeleton,
  castNotSkeletonDeep,
  getArrayFields,
  getFields,
  prepass,
  selectFields,
} from '../src';
import { $meta } from '../src/Accessor';
import { createTestClient, expectConsoleWarn } from './utils';

describe('selectFields', () => {
  it('recursive *, depth 1', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(
        query.human({
          name: 'foo',
        })
      );
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "__typename": "Human",
       "dogs": [
         null,
         null,
       ],
       "echo": [Function],
       "father": null,
       "id": "1",
       "name": "foo",
       "node": [
         null,
         null,
         null,
       ],
       "nullFather": null,
       "sons": [
         null,
         null,
       ],
       "union": [
         null,
         null,
         null,
       ],
     }
    `);
  });

  it('recursive *, depth 2', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(
        query.human({
          name: 'foo',
        }),
        '*',
        2
      );
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "__typename": "Human",
       "dogs": [
         {
           "__typename": "Dog",
           "bark": [Function],
           "id": "1",
           "name": "a",
           "owner": null,
         },
         {
           "__typename": "Dog",
           "bark": [Function],
           "id": "2",
           "name": "b",
           "owner": null,
         },
       ],
       "echo": [Function],
       "father": {
         "__typename": "Human",
         "dogs": [
           null,
           null,
         ],
         "echo": [Function],
         "father": null,
         "id": "4",
         "name": "default",
         "node": [
           null,
           null,
           null,
         ],
         "nullFather": null,
         "sons": [
           null,
           null,
         ],
         "union": [
           null,
           null,
           null,
         ],
       },
       "id": "1",
       "name": "foo",
       "node": [
         {
           "$on": null,
           "__typename": "A",
           "id": "1",
           "node": null,
         },
         {
           "$on": null,
           "__typename": "B",
           "id": "2",
           "node": null,
         },
         {
           "$on": null,
           "__typename": "C",
           "id": "3",
           "node": null,
         },
       ],
       "nullFather": null,
       "sons": [
         {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "4",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
         {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "4",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
       ],
       "union": [
         {
           "$on": null,
           "__typename": "A",
         },
         {
           "$on": null,
           "__typename": "B",
         },
         {
           "$on": null,
           "__typename": "C",
         },
       ],
     }
    `);
  });

  test('named no recursive', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(
        query.human({
          name: 'bar',
        }),
        ['name', 'father.name']
      );
    });

    expect(data).toMatchInlineSnapshot(`
      {
        "father": {
          "name": "default",
        },
        "name": "bar",
      }
    `);
  });

  test('named recursive, depth 1', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(
        query.human({
          name: 'bar',
        }),
        ['father']
      );
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "father": {
         "__typename": "Human",
         "dogs": [
           null,
           null,
         ],
         "echo": [Function],
         "father": null,
         "id": "2",
         "name": "default",
         "node": [
           null,
           null,
           null,
         ],
         "nullFather": null,
         "sons": [
           null,
           null,
         ],
         "union": [
           null,
           null,
           null,
         ],
       },
     }
    `);
  });

  test('named recursive, depth 2', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(
        query.human({
          name: 'bar',
        }),
        ['father'],
        2
      );
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "father": {
         "__typename": "Human",
         "dogs": [
           {
             "__typename": "Dog",
             "bark": [Function],
             "id": "1",
             "name": "a",
             "owner": null,
           },
           {
             "__typename": "Dog",
             "bark": [Function],
             "id": "2",
             "name": "b",
             "owner": null,
           },
         ],
         "echo": [Function],
         "father": {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "2",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
         "id": "2",
         "name": "default",
         "node": [
           {
             "$on": null,
             "__typename": "A",
             "id": "1",
             "node": null,
           },
           {
             "$on": null,
             "__typename": "B",
             "id": "2",
             "node": null,
           },
           {
             "$on": null,
             "__typename": "C",
             "id": "3",
             "node": null,
           },
         ],
         "nullFather": null,
         "sons": [
           {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "2",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
           {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "2",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
         ],
         "union": [
           {
             "$on": null,
             "__typename": "A",
           },
           {
             "$on": null,
             "__typename": "B",
           },
           {
             "$on": null,
             "__typename": "C",
           },
         ],
       },
     }
    `);
  });

  test('named recursive - array', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human().sons, ['name']);
    });

    expect(data).toMatchInlineSnapshot(`
      [
        {
          "name": "default",
        },
        {
          "name": "default",
        },
      ]
    `);
  });

  test('recursive * - array', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human().sons, '*');
    });

    expect(data).toMatchInlineSnapshot(`
     [
       {
         "__typename": "Human",
         "dogs": [
           null,
           null,
         ],
         "echo": [Function],
         "father": null,
         "id": "1",
         "name": "default",
         "node": [
           null,
           null,
           null,
         ],
         "nullFather": null,
         "sons": [
           null,
           null,
         ],
         "union": [
           null,
           null,
           null,
         ],
       },
       {
         "__typename": "Human",
         "dogs": [
           null,
           null,
         ],
         "echo": [Function],
         "father": null,
         "id": "1",
         "name": "default",
         "node": [
           null,
           null,
           null,
         ],
         "nullFather": null,
         "sons": [
           null,
           null,
         ],
         "union": [
           null,
           null,
           null,
         ],
       },
     ]
    `);
  });

  test('empty named fields array', async () => {
    const { query, resolved } = await createTestClient();

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

    const data = await resolved(() => {
      return selectFields(query.human(), []);
    });

    expect(data).toEqual({});
  });

  test('named fields array values - depth 1', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human(), ['sons']);
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "sons": [
         {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "1",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
         {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "1",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
       ],
     }
    `);
  });

  test('named fields array values - depth 2', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human(), ['sons'], 2);
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "sons": [
         {
           "__typename": "Human",
           "dogs": [
             {
               "__typename": "Dog",
               "bark": [Function],
               "id": "1",
               "name": "a",
               "owner": null,
             },
             {
               "__typename": "Dog",
               "bark": [Function],
               "id": "2",
               "name": "b",
               "owner": null,
             },
           ],
           "echo": [Function],
           "father": {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "1",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
           "id": "1",
           "name": "default",
           "node": [
             {
               "$on": null,
               "__typename": "A",
               "id": "1",
               "node": null,
             },
             {
               "$on": null,
               "__typename": "B",
               "id": "2",
               "node": null,
             },
             {
               "$on": null,
               "__typename": "C",
               "id": "3",
               "node": null,
             },
           ],
           "nullFather": null,
           "sons": [
             {
               "__typename": "Human",
               "dogs": [
                 null,
                 null,
               ],
               "echo": [Function],
               "father": null,
               "id": "1",
               "name": "default",
               "node": [
                 null,
                 null,
                 null,
               ],
               "nullFather": null,
               "sons": [
                 null,
                 null,
               ],
               "union": [
                 null,
                 null,
                 null,
               ],
             },
             {
               "__typename": "Human",
               "dogs": [
                 null,
                 null,
               ],
               "echo": [Function],
               "father": null,
               "id": "1",
               "name": "default",
               "node": [
                 null,
                 null,
                 null,
               ],
               "nullFather": null,
               "sons": [
                 null,
                 null,
               ],
               "union": [
                 null,
                 null,
                 null,
               ],
             },
           ],
           "union": [
             {
               "$on": null,
               "__typename": "A",
             },
             {
               "$on": null,
               "__typename": "B",
             },
             {
               "$on": null,
               "__typename": "C",
             },
           ],
         },
         {
           "__typename": "Human",
           "dogs": [
             {
               "__typename": "Dog",
               "bark": [Function],
               "id": "1",
               "name": "a",
               "owner": null,
             },
             {
               "__typename": "Dog",
               "bark": [Function],
               "id": "2",
               "name": "b",
               "owner": null,
             },
           ],
           "echo": [Function],
           "father": {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "1",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
           "id": "1",
           "name": "default",
           "node": [
             {
               "$on": null,
               "__typename": "A",
               "id": "1",
               "node": null,
             },
             {
               "$on": null,
               "__typename": "B",
               "id": "2",
               "node": null,
             },
             {
               "$on": null,
               "__typename": "C",
               "id": "3",
               "node": null,
             },
           ],
           "nullFather": null,
           "sons": [
             {
               "__typename": "Human",
               "dogs": [
                 null,
                 null,
               ],
               "echo": [Function],
               "father": null,
               "id": "1",
               "name": "default",
               "node": [
                 null,
                 null,
                 null,
               ],
               "nullFather": null,
               "sons": [
                 null,
                 null,
               ],
               "union": [
                 null,
                 null,
                 null,
               ],
             },
             {
               "__typename": "Human",
               "dogs": [
                 null,
                 null,
               ],
               "echo": [Function],
               "father": null,
               "id": "1",
               "name": "default",
               "node": [
                 null,
                 null,
                 null,
               ],
               "nullFather": null,
               "sons": [
                 null,
                 null,
               ],
               "union": [
                 null,
                 null,
                 null,
               ],
             },
           ],
           "union": [
             {
               "$on": null,
               "__typename": "A",
             },
             {
               "$on": null,
               "__typename": "B",
             },
             {
               "$on": null,
               "__typename": "C",
             },
           ],
         },
       ],
     }
    `);
  });

  test('named fields object values - depth 1', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human(), ['father']);
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "father": {
         "__typename": "Human",
         "dogs": [
           null,
           null,
         ],
         "echo": [Function],
         "father": null,
         "id": "1",
         "name": "default",
         "node": [
           null,
           null,
           null,
         ],
         "nullFather": null,
         "sons": [
           null,
           null,
         ],
         "union": [
           null,
           null,
           null,
         ],
       },
     }
    `);
  });

  test('named fields object values - depth 2', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.human(), ['father'], 2);
    });

    expect(data).toMatchInlineSnapshot(`
     {
       "father": {
         "__typename": "Human",
         "dogs": [
           {
             "__typename": "Dog",
             "bark": [Function],
             "id": "1",
             "name": "a",
             "owner": null,
           },
           {
             "__typename": "Dog",
             "bark": [Function],
             "id": "2",
             "name": "b",
             "owner": null,
           },
         ],
         "echo": [Function],
         "father": {
           "__typename": "Human",
           "dogs": [
             null,
             null,
           ],
           "echo": [Function],
           "father": null,
           "id": "1",
           "name": "default",
           "node": [
             null,
             null,
             null,
           ],
           "nullFather": null,
           "sons": [
             null,
             null,
           ],
           "union": [
             null,
             null,
             null,
           ],
         },
         "id": "1",
         "name": "default",
         "node": [
           {
             "$on": null,
             "__typename": "A",
             "id": "1",
             "node": null,
           },
           {
             "$on": null,
             "__typename": "B",
             "id": "2",
             "node": null,
           },
           {
             "$on": null,
             "__typename": "C",
             "id": "3",
             "node": null,
           },
         ],
         "nullFather": null,
         "sons": [
           {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "1",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
           {
             "__typename": "Human",
             "dogs": [
               null,
               null,
             ],
             "echo": [Function],
             "father": null,
             "id": "1",
             "name": "default",
             "node": [
               null,
               null,
               null,
             ],
             "nullFather": null,
             "sons": [
               null,
               null,
             ],
             "union": [
               null,
               null,
               null,
             ],
           },
         ],
         "union": [
           {
             "$on": null,
             "__typename": "A",
           },
           {
             "$on": null,
             "__typename": "B",
           },
           {
             "$on": null,
             "__typename": "C",
           },
         ],
       },
     }
    `);
  });

  test('named non-existent field', async () => {
    const { query, resolved } = await createTestClient();

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

    const data = await resolved(() => {
      return selectFields(query.human(), ['non_existent_field']);
    });

    expect(data).toStrictEqual({});
  });

  test('null accessor', async () => {
    const { query, resolved } = await createTestClient();

    const data = await resolved(() => {
      return selectFields(query.nullArray);
    });

    expect(data).toBe(null);
  });

  test('primitive wrong accessor', async () => {
    const { resolved } = await createTestClient();

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

    const data = await resolved(() => {
      return selectFields(123 as any);
    });

    expect(data).toBe(123);
  });

  test('object wrong accessor', async () => {
    const { resolved } = await createTestClient();

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

    const data = await resolved(() => {
      return selectFields({
        a: 1,
      });
    });

    expect(data).toStrictEqual({
      a: 1,
    });
  });
});

describe('refetch function', () => {
  test('refetch works', async () => {
    const { query, refetch, resolved } = await createTestClient();

    const a = query.hello;

    expect(a).toBe(undefined);

    await resolved(() => query.hello);

    const a2 = query.hello;

    expect(a2).toBe('hello world');

    await expect(refetch(() => query.hello)).resolves.toBe('hello world');

    const a3 = query.hello;

    expect(a3).toBe(a2);
  });

  test('warns about no selections inside function, except on production', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation((message) => {
      expect(message).toMatchInlineSnapshot(
        `"[gqty] Warning! No data requested."`
      );
    });
    const prevEnv = process.env.NODE_ENV;

    try {
      const { refetch } = await createTestClient();

      const value = await refetch(() => {
        return 123;
      });

      expect(value).toBe(123);
      expect(spy).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = 'production';

      const value2 = await refetch(() => {
        return 456;
      });

      expect(value2).toBe(456);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      process.env.NODE_ENV = prevEnv;
      spy.mockRestore();
    }
  });

  test('refetch proxy selections', async () => {
    const {
      query,
      resolved,
      refetch,
      schema: cache,
    } = await createTestClient();

    const time1 = await resolved(() => query.time);

    const cacheSnapshot1 = JSON.stringify(cache);

    expect(time1).toBeTruthy();

    const time2 = query.time;

    const cacheSnapshot2 = JSON.stringify(cache);

    expect(cacheSnapshot1).toBe(cacheSnapshot2);

    expect(time2).toBe(time1);

    await refetch(query);

    const cacheSnapshot3 = JSON.stringify(cache);

    expect(cacheSnapshot3).not.toBe(cacheSnapshot2);

    const time3 = query.time;

    const cacheSnapshot4 = JSON.stringify(cache);

    expect(cacheSnapshot4).toBe(cacheSnapshot3);

    expect(time3).not.toBe(time1);

    const noSelectionsToRefetchData = await refetch(query.nullArray);

    expect(noSelectionsToRefetchData).toBeTruthy();

    const cacheSnapshot5 = JSON.stringify(cache);

    expect(cacheSnapshot5).toBe(cacheSnapshot3);

    const hello = await resolved(() => query.hello);

    const cacheSnapshot6 = JSON.stringify(cache);

    expect(cacheSnapshot6).not.toBe(cacheSnapshot5);

    expect(hello).toBe('hello world');

    const time4 = query.time;

    expect(time4).toBe(time3);

    await refetch(query);

    const time5 = query.time;

    expect(time5).not.toBe(time4);
  });

  test('refetch proxy selections with invalid proxy', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation((message) => {
      expect(message).toBe('[gqty] Invalid proxy to refetch!');
    });

    const prevNODE_ENV = process.env.NODE_ENV;
    try {
      const { refetch } = await createTestClient();

      const invalidProxy = {};
      const refetchData = await refetch(invalidProxy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(refetchData).toBe(invalidProxy);

      process.env.NODE_ENV = 'production';

      const refetchData2 = await refetch(invalidProxy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(refetchData2).toBe(invalidProxy);
    } finally {
      process.env.NODE_ENV = prevNODE_ENV;
      spy.mockRestore();
    }
  });
});

describe('get fields', () => {
  test('getFields works', async () => {
    const { resolved, query } = await createTestClient(
      undefined,
      undefined,
      undefined,
      { cache: new Cache(undefined, { normalization: false }) }
    );

    await resolved(() => {
      const humanProxy = getFields(query.human(), 'name', 'id');

      expect($meta(humanProxy)).toBeDefined();
    });

    const humanProxy = query.human();

    expect(humanProxy.id).toBe('1');
    expect(humanProxy.name).toBe('default');

    await resolved(() => getFields(query.human({ name: 'other' })));

    const human2 = query.human({ name: 'other' });

    expect(JSON.stringify(human2)).toMatchInlineSnapshot(
      `"{"__typename":"Human","id":"2","name":"other"}"`
    );

    expect(getFields(null)).toBe(null);
  });

  test('getArrayFields works', async () => {
    const { resolved, query } = await createTestClient();

    const dogsArrayProxy = getArrayFields(query.dogs, 'name');

    expect($meta(dogsArrayProxy)).toBeDefined();

    await expect(
      resolved(() => query.dogs.map((v) => v.name).join(','))
    ).resolves.toBe('a,b');

    expect(getArrayFields(null)).toBe(null);

    const emptyObj: any = {};
    expect(getArrayFields(emptyObj)).toBe(emptyObj);

    const emptyArray = [null, undefined];

    expect(getArrayFields(emptyArray)).toBe(emptyArray);
  });
});

describe('prefetch', () => {
  test('returns promise only data not found', async () => {
    const { prefetch } = await createTestClient(
      undefined,
      undefined,
      undefined,
      { cache: new Cache(undefined, { maxAge: 100 }) }
    );

    const resultPromise = prefetch((query) => query.time);

    expect(resultPromise).toBeInstanceOf(Promise);

    const result = await resultPromise;
    expect(typeof result).toBe('string');

    expect(prefetch((query) => query.time)).toBe(result);
  });
});

test('prepass works', () => {
  const proxy1 = new Proxy(
    {
      a: 123,
      passed: false,
    },
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === 'a') {
          t.passed = true;
        }
        return Reflect.get(t, p);
      },
    }
  );

  const proxy2 = new Proxy(
    {
      b: proxy1,
      passed: false,
    },
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === 'b') {
          t.passed = true;
        }
        return Reflect.get(t, p);
      },
    }
  );

  const arrayProxy = new Proxy(
    Object.assign([null, proxy2], {
      passed: false,
    }),
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === '1') {
          t.passed = true;
        }
        return Reflect.get(t, p);
      },
    }
  );

  const expectedVariable = {
    n: 999,
  };

  const proxyWithFn = new Proxy(
    {
      fnField(variable: unknown) {
        expect(JSON.stringify(variable)).toBe(JSON.stringify(expectedVariable));
        return arrayProxy;
      },
      passed: false,
    },
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === 'fnField') {
          t.passed = true;
        }

        return Reflect.get(t, p);
      },
    }
  );

  expect(proxy1.passed).toBe(false);
  expect(proxy2.passed).toBe(false);
  expect(arrayProxy.passed).toBe(false);
  expect(proxyWithFn.passed).toBe(false);

  prepass(
    proxyWithFn,
    [
      {
        field: 'fnField',
        variables: {
          n: 999,
        },
      },
      'b',
      'a',
      'z',
    ],
    'non.existent.field'
  );

  expect(proxy1.passed).toBe(true);
  expect(proxy2.passed).toBe(true);
  expect(arrayProxy.passed).toBe(true);
  expect(proxyWithFn.passed).toBe(true);

  const arr = [null, undefined];
  const returnedArr = prepass(arr, 'helloWorld');
  expect(arr).toBe(returnedArr);

  expect(prepass(null)).toBe(null);

  expect(prepass(undefined)).toBe(undefined);

  const proxy3 = new Proxy(
    {
      c: 123,
      passed: false,
    },
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === 'c') {
          t.passed = true;
        }
        return Reflect.get(t, p);
      },
    }
  );

  const proxy4 = new Proxy(
    {
      a: {
        b: proxy3,
      },
      passed: false,
    },
    {
      set(t, p, v) {
        return Reflect.set(t, p, v);
      },
      get(t, p) {
        if (p === 'a') {
          t.passed = true;
        }
        return Reflect.get(t, p);
      },
    }
  );

  expect(proxy3.passed).toBe(false);
  expect(proxy4.passed).toBe(false);

  expect(prepass(proxy4, 'a.b.c')).toBe(proxy4);

  expect(proxy3.passed).toBe(true);
  expect(proxy4.passed).toBe(true);
});

test('type casters', async () => {
  type Equals<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
      ? true
      : false;

  const a1: {
    a: string | undefined;
    b: number | null | undefined;
    c: {
      d: number | undefined;
    };
  } = {} as any;

  let a2 = castNotSkeleton(a1);

  expect(a2).toBe(a1);

  const equals: true = true as Equals<
    typeof a2,
    {
      a: string;
      b: number | null;
      c: {
        d: number | undefined;
      };
    }
  >;

  expect(equals).toBe(true);

  const b1: {
    a: string | undefined;
    b: {
      c:
        | {
            d: {
              e: (
                | {
                    f: {
                      h: [
                        {
                          i: number | undefined;
                        },
                      ];
                    };
                  }
                | undefined
                | null
              )[];
              j: () => string | undefined;
            };
          }
        | undefined;
    };
  } = {} as any;

  let b2 = castNotSkeletonDeep(b1);

  const equal2: true = true as Equals<
    typeof b2,
    {
      a: string;
      b: {
        c: {
          d: {
            e: ({
              f: {
                h: {
                  i: number;
                }[];
              };
            } | null)[];
            j: () => string;
          };
        };
      };
    }
  >;

  expect(equal2).toBe(true);
});
