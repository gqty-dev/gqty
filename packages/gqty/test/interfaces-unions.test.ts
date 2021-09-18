import { createTestClient, TestClient } from './utils';

const testClientPromise = createTestClient();

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
      Object {
        "data": Object {
          "node": Object {
            "__typename": "A",
            "a": 1,
            "id": "1",
          },
        },
      }
    `);

    expect(await query('{node(type:B){__typename id ...on B{b}}}'))
      .toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "node": Object {
            "__typename": "B",
            "b": 2,
            "id": "2",
          },
        },
      }
    `);

    expect(await query('{node(type:C){__typename id ...on C{c}}}'))
      .toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "node": Object {
            "__typename": "C",
            "c": 3,
            "id": "3",
          },
        },
      }
    `);

    expect(await query('{union(type:A){__typename ...on A{id a}}}'))
      .toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "union": Object {
            "__typename": "A",
            "a": 1,
            "id": "1",
          },
        },
      }
    `);

    expect(await query('{union(type:B){__typename ...on B{id b}}}'))
      .toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "union": Object {
            "__typename": "B",
            "b": 2,
            "id": "2",
          },
        },
      }
    `);

    expect(await query('{union(type:C){__typename ...on C{id c}}}'))
      .toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "union": Object {
            "__typename": "C",
            "c": 3,
            "id": "3",
          },
        },
      }
    `);
  });
});
