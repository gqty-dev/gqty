import { Cache } from 'gqty';
import { createTestClient } from './utils';

const testClientPromise = createTestClient(undefined, undefined, undefined, {
  cache: new Cache(undefined, { normalization: true }),
});

let testClient: Awaited<typeof testClientPromise>;
beforeAll(async () => {
  testClient = await testClientPromise;
});

describe('interfaces and unions', () => {
  test('api works as expected', async () => {
    const {
      client: { query },
    } = testClient;

    expect(await query('{node(type:A){__typename id ...on A{a}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "node": {
            "__typename": "A",
            "a": 1,
            "id": "1",
          },
        },
      }
    `);

    expect(await query('{node(type:B){__typename id ...on B{b}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "node": {
            "__typename": "B",
            "b": 2,
            "id": "2",
          },
        },
      }
    `);

    expect(await query('{node(type:C){__typename id ...on C{c}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "node": {
            "__typename": "C",
            "c": 3,
            "id": "3",
          },
        },
      }
    `);

    expect(await query('{union(type:A){__typename ...on A{id a}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "union": {
            "__typename": "A",
            "a": 1,
            "id": "1",
          },
        },
      }
    `);

    expect(await query('{union(type:B){__typename ...on B{id b}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "union": {
            "__typename": "B",
            "b": 2,
            "id": "2",
          },
        },
      }
    `);

    expect(await query('{union(type:C){__typename ...on C{id c}}}'))
      .toMatchInlineSnapshot(`
      {
        "data": {
          "union": {
            "__typename": "C",
            "c": 3,
            "id": "3",
          },
        },
      }
    `);
  });

  test('basic', async () => {
    const { resolved, query, queries } = testClient;

    const nodeResult = await resolved(() => {
      const nodeA = query.node({
        type: 'A',
      });
      const a = nodeA.$on.A?.a;
      const __typename = nodeA.__typename;
      const b = nodeA.$on.B?.b;

      return {
        __typename,
        a,
        b,
      };
    });

    expect(nodeResult).toMatchInlineSnapshot(`
      {
        "__typename": "A",
        "a": 1,
        "b": undefined,
      }
    `);

    expect(queries).toMatchInlineSnapshot(`
      [
        {
          "query": "query($a385fe:NodeType!){a0b55:node(type:$a385fe){__typename ...on A{a}...on B{b}id}}",
          "result": {
            "data": {
              "a0b55": {
                "__typename": "A",
                "a": 1,
                "id": "1",
              },
            },
          },
          "variables": {
            "a385fe": "A",
          },
        },
      ]
    `);

    expect(nodeResult).toStrictEqual({
      __typename: 'A',
      a: 1,
      b: undefined,
    });
  });

  test('deep', async () => {
    const { resolved, query, queries } = await createTestClient(
      undefined,
      undefined,
      undefined,
      { cache: new Cache(undefined, { normalization: true }) }
    );

    const nodeResult = await resolved(() => {
      const nodeA = query.node({
        type: 'A',
      });
      const a = nodeA.$on.A?.a;
      const __typename = nodeA.__typename;
      const b = nodeA.$on.B?.b;
      const aNodeId = nodeA.$on.A?.node.$on.A?.id;
      const deepNodeAId = nodeA.$on.A?.node.$on.A?.node.$on.C?.node.$on.A?.id;

      return {
        __typename,
        a,
        b,
        aNodeId,
        deepNodeAId,
      };
    });

    expect(nodeResult).toMatchInlineSnapshot(`
      {
        "__typename": "A",
        "a": 1,
        "aNodeId": "1",
        "b": undefined,
        "deepNodeAId": undefined,
      }
    `);
    expect(queries).toMatchInlineSnapshot(`
      [
        {
          "query": "query($a385fe:NodeType!){a0b55:node(type:$a385fe){__typename ...on A{a node{__typename ...on A{id node{__typename ...on C{node{__typename ...on A{id}id}}id}}id}}...on B{b}id}}",
          "result": {
            "data": {
              "a0b55": {
                "__typename": "A",
                "a": 1,
                "id": "1",
                "node": {
                  "__typename": "A",
                  "id": "1",
                  "node": {
                    "__typename": "A",
                    "id": "1",
                  },
                },
              },
            },
          },
          "variables": {
            "a385fe": "A",
          },
        },
      ]
    `);
  });
});
