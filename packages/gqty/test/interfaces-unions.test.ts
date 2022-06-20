import { createTestClient, TestClient } from './utils';

const testClientPromise = createTestClient(undefined, undefined, undefined, {
  normalization: true,
});

let testClient: TestClient;
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
          "query": "query($type1:NodeType!){node_6c4a1_78028:node(type:$type1){__typename id ...on A{id a}...on B{id b}}}",
          "result": {
            "data": {
              "node_6c4a1_78028": {
                "__typename": "A",
                "a": 1,
                "id": "1",
              },
            },
          },
          "variables": {
            "type1": "A",
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
    const { resolved, query, queries } = await createTestClient();

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
          "query": "query($type1:NodeType!){node_6c4a1_78028:node(type:$type1){__typename id ...on A{id a node{__typename id ...on A{id node{__typename id ...on C{id node{__typename id ...on A{id}}}}}}}...on B{id b}}}",
          "result": {
            "data": {
              "node_6c4a1_78028": {
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
            "type1": "A",
          },
        },
      ]
    `);
  });
});
