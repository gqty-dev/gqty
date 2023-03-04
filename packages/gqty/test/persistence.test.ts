import { Cache } from '../src/Cache';
import { defaultNormalizationHandler } from '../src/Cache/normalization';
import {
  exportCacheSnapshot,
  importCacheSnapshot,
} from '../src/Cache/persistence';
import { createTestClient, expectConsoleWarn, sleep } from './utils';

describe('Cache#persistence', () => {
  it('should restore circular normalied snapshot', () => {
    const cache = importCacheSnapshot(
      {
        normalized: {
          'A:1': { __typename: 'A', id: '1', b: { __ref: 'B:1' } },
          'B:1': { __typename: 'B', id: '1', a: { __ref: 'A:1' } },
        },
        query: {
          a: { __ref: 'A:1' },
          b: { c: 1 },
        },
      },
      defaultNormalizationHandler
    );

    expect(cache).toMatchInlineSnapshot(`
      {
        "normalizedObjects": {
          "A:1": {
            "__typename": "A",
            "b": {
              "__typename": "B",
              "a": [Circular],
              "id": "1",
            },
            "id": "1",
          },
          "B:1": {
            "__typename": "B",
            "a": {
              "__typename": "A",
              "b": [Circular],
              "id": "1",
            },
            "id": "1",
          },
        },
        "query": {
          "a": {
            "__typename": "A",
            "b": {
              "__typename": "B",
              "a": [Circular],
              "id": "1",
            },
            "id": "1",
          },
          "b": {
            "c": 1,
          },
        },
      }
    `);

    const snapshot = exportCacheSnapshot(cache, defaultNormalizationHandler);

    expect(snapshot).toMatchInlineSnapshot(`
      {
        "normalized": {
          "A:1": {
            "__typename": "A",
            "b": {
              "__ref": "B:1",
            },
            "id": "1",
          },
          "B:1": {
            "__typename": "B",
            "a": {
              "__ref": "A:1",
            },
            "id": "1",
          },
        },
        "query": {
          "a": {
            "__ref": "A:1",
          },
          "b": {
            "c": 1,
          },
        },
      }
    `);
  });

  it('should persist data snapshots', () => {
    const snapshot = { query: { __typename: 'a', id: 1 } };

    const normie = new Cache(snapshot, { normalization: true });
    expect(JSON.stringify(normie)).toMatchInlineSnapshot(
      `"{"query":{"__ref":"a:1"},"normalized":{"a:1":{"__typename":"a","id":1}}}"`
    );

    const hippie = new Cache(snapshot);
    expect(JSON.stringify(hippie)).toMatchInlineSnapshot(
      `"{"query":{"__typename":"a","id":1}}"`
    );
  });
});

test('basic functionality', async () => {
  const client1 = await createTestClient();

  expect(client1.persist()).toStrictEqual({});

  await client1.resolved(
    () =>
      client1.query.human({
        name: 'asd',
      }).name
  );

  const dataBackup1 = client1.persist();

  expect(JSON.stringify(dataBackup1)).toMatchInlineSnapshot(
    `"{"query":{"b306d":{"__ref":"Human:1"}},"normalized":{"Human:1":{"__typename":"Human","id":"1","name":"asd"}}}"`
  );

  const client2 = await createTestClient();

  expect(client2.restore(dataBackup1)).toBe(true);
  expect(client2.persist()).toStrictEqual(dataBackup1);

  expect(
    client1.query.human({
      name: 'asd',
    }).name
  ).toBe('asd');

  expect(
    client1.query.human({
      name: 'asd',
    }).id
  ).toBe('1');

  expect(
    client2.query.human({
      name: 'asd',
    }).name
  ).toBe('asd');

  expect(
    client2.query.human({
      name: 'asd',
    }).id
  ).toBe('1');

  await client2
    .restoreAsync(async () => {
      await sleep(200);
      throw Error();
    })
    .then((value) => {
      expect(value).toBe(false);
    });

  await client2
    .restoreAsync(async () => {
      await sleep(200);
      return dataBackup1;
    })
    .then((value) => {
      expect(value).toBe(true);
    });
});

test('version check', async () => {
  const client1 = await createTestClient();

  expectConsoleWarn((n, message) => {
    switch (n) {
      case 1:
        expect(message).toMatchInlineSnapshot(
          `"[GQty] Cache version mismatch, ignored."`
        );
        break;
      case 2:
        expect(message).toMatchInlineSnapshot(
          `"[GQty] Cache version mismatch, ignored."`
        );
        break;
      case 3:
        expect(message).toMatchInlineSnapshot(
          `"[GQty] Cache version mismatch, ignored."`
        );
        break;
      default:
        throw Error('Unexpected warn: ' + message);
    }
  });

  const emptyPersistenceV1 = client1.persist('v1');
  expect(JSON.stringify(emptyPersistenceV1)).toMatchInlineSnapshot(
    `"{"version":"v1"}"`
  );

  await client1.resolved(
    () =>
      client1.query.human({
        name: 'asd',
      }).name
  );

  expect(
    client1.query.human({
      name: 'asd',
    }).name
  ).toBe('asd');

  const cacheBackupv1 = client1.persist('v1');

  expect(JSON.stringify(cacheBackupv1)).toMatchInlineSnapshot(
    `"{"query":{"b306d":{"__ref":"Human:1"}},"normalized":{"Human:1":{"__typename":"Human","id":"1","name":"asd"}},"version":"v1"}"`
  );

  const client2 = await createTestClient();

  const emptyPersistenceV2 = client2.persist('v2');

  expect(JSON.stringify(emptyPersistenceV2)).toMatchInlineSnapshot(
    `"{"version":"v2"}"`
  );

  expect(client2.restore(cacheBackupv1, 'v2')).toBe(false);

  expect(client2.persist('v2')).toStrictEqual(emptyPersistenceV2);

  const wrongBackupVersion = client2.persist(123 as any);

  expect(JSON.stringify(wrongBackupVersion)).toMatchInlineSnapshot(
    `"{"version":123}"`
  );

  expect(client2.restore(wrongBackupVersion, 123 as any)).toBe(false);

  expect(client2.restore(emptyPersistenceV2)).toBe(false);

  expect(client2.restore('[]' as any)).toBe(false);

  expect(client2.persist('v2')).toStrictEqual(emptyPersistenceV2);

  expect(client2.restore(emptyPersistenceV2, 'v2')).toBe(true);

  expect(client2.persist('v2')).toStrictEqual(emptyPersistenceV2);
});
