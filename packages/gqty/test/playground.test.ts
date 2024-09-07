import { Cache, selectFields } from '../src';
import { assignSelections, setCache } from '../src/Accessor';
import { createTestClient } from './utils';

it('ok', () => {
  expect(1).toBe(1);
});

describe('playground', () => {
  test('cache manipulation', async () => {
    const {
      query,
      resolved,
      schema: cache,
    } = await createTestClient(undefined, undefined, undefined, {
      cache: new Cache(undefined, { normalization: true }),
    });

    await resolved(() => query.human().sons.map((v) => selectFields(v)));

    let humanA = query.human({
      name: 'asd',
    });

    setCache(humanA, {
      name: 'asd',
    });

    expect(humanA.name).toBe('asd');

    setCache(query.human({ name: 'zxc' }), {
      name: 'tyu',
    });

    const humanB = query.human({
      name: 'zxc',
    });

    expect(humanB.name).toBe('tyu');

    query.human().sons = [];

    const xd = (query.hello = 'XDXD');

    expect(xd).toBe('XDXD');

    const hello = query.hello;

    expect(hello).toBe('XDXD');

    expect(query.human().sons).toEqual([]);

    expect(JSON.stringify(cache)).toMatchInlineSnapshot(
      `"{"query":{"human":{"__ref":"Human:1"},"hello":"XDXD"},"normalized":{"Human:1":{"__typename":"Human","dogs":[{"__typename":"Dog"},{"__typename":"Dog"}],"father":{"__typename":"Human"},"id":"1","name":"default","node":[{"__typename":"A"},{"__typename":"B"},{"__typename":"C"}],"nullFather":null,"sons":[],"union":[{"__typename":"A"},{"__typename":"B"},{"__typename":"C"}]}}}"`
    );

    setCache(query, {
      hello: 'ppp',
    });

    expect(JSON.stringify(query)).toMatchInlineSnapshot(`"{"hello":"ppp"}"`);
  });

  test('assignSelections', async () => {
    const {
      query,
      schema: cache,
      resolve,
      mutate,
    } = await createTestClient(undefined, undefined, undefined, {
      cache: new Cache(undefined, { normalization: true }),
    });

    await resolve(({ query }) => query.human({ name: 'asd' }).name);

    const human = query.human({
      name: 'asd',
    });

    expect(human.name).toBe('asd');

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalized": {
          "Human:1": {
            "__typename": "Human",
            "id": "1",
            "name": "asd",
          },
        },
        "query": {
          "a3750d": {
            "__ref": "Human:1",
          },
        },
      }
    `);

    const humanMutation = await mutate((mutation) => {
      const humanMutation = mutation.humanMutation({
        nameArg: 'zxc',
      });
      assignSelections(human, humanMutation);
      return humanMutation;
    });

    setCache(human, humanMutation);

    expect(human.name).toBe('zxc');
    expect(humanMutation.name).toBe('zxc');
  });
});
