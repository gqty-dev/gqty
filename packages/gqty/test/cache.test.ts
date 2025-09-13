import { createSchemaAccessor } from '../src/Accessor';
import { Cache, type CacheRoot } from '../src/Cache';
import { Selection } from '../src/Selection';

describe('Cache#dataAccessors', () => {
  const mockContext = {
    schema: {
      query: {
        __typename: { __type: 'String!' },
        a: { __type: 'String!' },
        b: { __type: 'B!' },
      },
      B: {
        c: { __type: 'String!' },
      },
    },
    scalars: { String: true },
    depthLimit: 15,
    select: () => {},
    subscribeSelect: () => () => {},
    dispose: () => {},
    subscribeDispose: () => () => {},
    reset: () => {},
    notifyCacheUpdate: false,
    shouldFetch: false,
    hasCacheHit: false,
    hasCacheMiss: false,
  } as const;

  it('should make selections', () => {
    const cache = new Cache();
    const {
      accessor: { query },
    } = createSchemaAccessor<{
      query: { b: { c: string } };
    }>({
      ...mockContext,
      cache,
      select(selection) {
        selections.push(selection);
      },
    });
    const selections: Selection[] = [];

    query.b.c;

    expect(selections.length).toBe(1);
    expect(selections[0].cacheKeys.join('.')).toBe('query.b.c');
  });
});

describe('Cache#data', () => {
  const mockContext = {
    schema: {
      query: {
        nullArray: { __type: '[String!]' },
      },
    },
    scalars: { String: true },
    depthLimit: 15,
    select: () => {},
    subscribeSelect: () => () => {},
    dispose: () => {},
    subscribeDispose: () => () => {},
    reset: () => {},
    notifyCacheUpdate: false,
    shouldFetch: false,
    hasCacheHit: false,
    hasCacheMiss: false,
  } as const;

  it('should work with selections', () => {
    const cache = new Cache();
    const selectionBase = Selection.createRoot('query');
    const selection = selectionBase.getChild('a');

    const dataEmpty = cache.get(selection.cacheKeys.join('.'))?.data;
    expect(dataEmpty).toBe(undefined);

    cache.set({
      query: {
        a: 1,
      },
    });

    const data = cache.get(selection.cacheKeys.join('.'))?.data;
    expect(data).toBe(1);
  });

  it('should be JSON serializable', async () => {
    const cache = new Cache({ query: { nullArray: [] } });
    const {
      accessor: { query },
    } = createSchemaAccessor({ ...mockContext, cache });

    expect(query).toMatchInlineSnapshot(`
      {
        "__typename": "Query",
      }
    `);
    expect(query.nullArray).toMatchInlineSnapshot(`[]`);
  });

  it('should merge on top-level keys', () => {
    const cache = new Cache();

    function expectCacheToBe(v: CacheRoot) {
      try {
        expect(JSON.stringify(cache)).toBe(JSON.stringify(v));
      } catch (err: any) {
        Error.captureStackTrace(err, expectCacheToBe);
        throw err;
      }
    }

    cache.set({
      query: {
        other: 123,
        array1: [1, 2],
        array2: [{ a: 1 }],
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: [1, 2],
        array2: [{ a: 1 }],
      },
    });

    cache.set({
      query: {
        array1: [3],
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: [3],
        array2: [{ a: 1 }],
      },
    });

    cache.set({
      query: {
        array2: [{ b: 2 }],
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: [3],
        array2: [{ b: 2 }],
      },
    });

    cache.set({
      query: {
        array2: [],
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: [3],
        array2: [],
      },
    });

    cache.set({
      query: {
        array2: [
          { __typename: 'c', c: 1 },
          { __typename: 'd', d: 1 },
          { __typename: 'e', e: 1 },
        ],
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: [3],
        array2: [
          { __typename: 'c', c: 1 },
          { __typename: 'd', d: 1 },
          { __typename: 'e', e: 1 },
        ],
      },
    });

    cache.set({
      query: {
        array1: null,
      },
    });

    expectCacheToBe({
      query: {
        other: 123,
        array1: null,
        array2: [
          { __typename: 'c', c: 1 },
          { __typename: 'd', d: 1 },
          { __typename: 'e', e: 1 },
        ],
      },
    });
  });
});

describe('Cache#normalization', () => {
  it('should work', () => {
    const cache = new Cache(undefined, {
      maxAge: Infinity,
      normalization: true,
    });

    cache.set({
      query: {
        a: {
          __typename: 'A',
          id: 1,
          a: 1,
        },
      },
    });

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalized": {
          "A:1": {
            "__typename": "A",
            "a": 1,
            "id": 1,
          },
        },
        "query": {
          "a": {
            "__ref": "A:1",
          },
        },
      }
    `);

    // Should merge object on incoming superset.
    cache.set({
      query: {
        a: {
          __typename: 'A',
          id: 1,
          a: 1,
          b: 2,
        },
      },
    });

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalized": {
          "A:1": {
            "__typename": "A",
            "a": 1,
            "b": 2,
            "id": 1,
          },
        },
        "query": {
          "a": {
            "__ref": "A:1",
          },
        },
      }
    `);

    cache.set({
      query: {
        otherQuery: {
          __typename: 'O',
          id: 1,
          deep: {
            __typename: 'A',
            id: 1,
            c: 3,
          },
        },
      },
    });

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalized": {
          "A:1": {
            "__typename": "A",
            "a": 1,
            "b": 2,
            "c": 3,
            "id": 1,
          },
          "O:1": {
            "__typename": "O",
            "deep": {
              "__ref": "A:1",
            },
            "id": 1,
          },
        },
        "query": {
          "a": {
            "__ref": "A:1",
          },
          "otherQuery": {
            "__ref": "O:1",
          },
        },
      }
    `);

    const selection = Selection.createRoot('query').getChild('a');

    expect(cache.get(selection.cacheKeys.join('.'))?.data)
      .toMatchInlineSnapshot(`
      {
        "__typename": "A",
        "a": 1,
        "b": 2,
        "c": 3,
        "id": 1,
      }
    `);
  });
});

describe('Cache#subscribe', () => {
  it('should notify direct subscribers', () => {
    const cache = new Cache();
    const listener = jest.fn();
    const unsub = cache.subscribe(['query.a', 'query.b.a'], listener);

    cache.set({ query: { a: 1 } });
    cache.set({ query: { b: { a: 1 } } });

    expect(listener).toHaveBeenCalledTimes(2);

    unsub();
  });

  it('should notify normalized subscribers', () => {
    const cache = new Cache(undefined, {
      maxAge: Infinity,
      normalization: true,
    });
    const listener = jest.fn();
    const subs: Array<() => void> = [];

    cache.set({
      query: {
        a: {
          __typename: 'A',
          id: 1,
          b: { __typename: 'B', id: 1 },
        },
      },
    });

    // Referencing a normalized object
    subs.push(cache.subscribe(['query.a.__typename'], listener));

    // Update normalized object from a different path
    cache.set({
      query: {
        b: {
          __typename: 'B',
          id: 1,
          a: { __typename: 'A', id: 1, a: 1 },
        },
      },
    });

    expect(listener).toHaveBeenCalledWith({
      query: {
        b: {
          __typename: 'B',
          id: 1,
          a: expect.objectContaining({
            __typename: 'A',
            id: 1,
            a: 1,
            // b: [Circular]
          }),
        },
      },
    });

    cache.set({
      query: {
        c: {
          a: { __typename: 'A', id: 1, a: 1, b: 2 },
        },
      },
    });

    expect(listener).toHaveBeenCalledWith({
      query: { c: { a: { __typename: 'A', id: 1, a: 1, b: 2 } } },
    });

    expect(listener).toHaveBeenCalledTimes(2);

    subs.forEach((unsub) => unsub());
  });

  it('should work with arrays', () => {
    const cache = new Cache({
      query: {
        a: [1, 2, 3],
        b: [
          { __typename: 'B', id: 1, a: 1 },
          { __typename: 'B', id: 2 },
        ],
      },
    });
    const listener = jest.fn();

    cache.subscribe(['query.b.a'], listener);
    cache.set({
      query: {
        b: [{ __typename: 'B', id: 1, a: 2 }],
      },
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(cache).toMatchInlineSnapshot(`
      {
        "query": {
          "a": [
            1,
            2,
            3,
          ],
          "b": [
            {
              "__typename": "B",
              "a": 2,
              "id": 1,
            },
          ],
        },
      }
    `);
  });

  it('should work with normalized arrays', () => {
    const cache = new Cache(
      {
        query: {
          a: [1, 2, 3],
          b: [
            { __typename: 'B', id: 1, b: 1 },
            { __typename: 'B', id: 2, b: 2 },
            { __typename: 'B', id: 3, b: 3 },
          ],
        },
      },
      { normalization: true }
    );
    const listener = jest.fn();

    cache.subscribe(['query.b.b'], listener);

    cache.set({
      query: {
        c: { __typename: 'B', id: 2, b: 4 },
      },
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      query: {
        c: { __typename: 'B', id: 2, b: 4 },
      },
    });

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalized": {
          "B:1": {
            "__typename": "B",
            "b": 1,
            "id": 1,
          },
          "B:2": {
            "__typename": "B",
            "b": 4,
            "id": 2,
          },
          "B:3": {
            "__typename": "B",
            "b": 3,
            "id": 3,
          },
        },
        "query": {
          "a": [
            1,
            2,
            3,
          ],
          "b": [
            {
              "__ref": "B:1",
            },
            {
              "__ref": "B:2",
            },
            {
              "__ref": "B:3",
            },
          ],
          "c": {
            "__ref": "B:2",
          },
        },
      }
    `);
  });
});
