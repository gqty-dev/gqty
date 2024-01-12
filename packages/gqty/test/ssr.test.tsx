import React from 'react';
import { renderToString } from 'react-dom/server';
import { waitForExpect } from 'test-utils';
import { $meta } from '../src/Accessor';
import { GQtyError } from '../src/Error';
import { createTestClient } from './utils';

describe('server side rendering', () => {
  test('expected usage works', async () => {
    const { hydrateCache, prepareRender, query } = await createTestClient();

    const TestComponent = () => {
      return (
        <div>
          <p>{query.hello}</p>
          <p>{query.time}</p>
        </div>
      );
    };

    const { cacheSnapshot } = await prepareRender(async () => {
      renderToString(<TestComponent />);
    });

    const time0 = query.time;

    expect(time0).toBeTruthy();

    // We simulate the difference in server-client by resetting the cache
    $meta(query)!.cache.data = {};

    hydrateCache({
      cacheSnapshot,
      shouldRefetch: true,
    });

    const page = renderToString(<TestComponent />);

    expect(page).toContain('hello world');
    expect(page).toContain(time0);

    const time1 = query.time;

    expect(time1).toBe(time0);

    expect(time1).toBeTruthy();

    expect(page).toContain(time1);

    await waitForExpect(
      () => {
        expect(query.time).not.toBe(time1);
      },
      500,
      1
    );

    const time2 = query.time;

    const page2 = renderToString(<TestComponent />);

    expect(page2).toContain('hello world');

    expect(time2).toBeTruthy();

    expect(page2).toContain(time2);

    hydrateCache({
      cacheSnapshot,
      shouldRefetch: false,
    });

    const page3 = renderToString(<TestComponent />);

    expect(page3).toContain('hello world');
    expect(page3).toContain(time0);

    hydrateCache({
      cacheSnapshot,
      shouldRefetch: 100,
    });

    await waitForExpect(
      () => {
        expect(query.time).not.toBe(time1);
      },
      500,
      1
    );

    const time3 = query.time;

    const page4 = renderToString(<TestComponent />);

    expect(page4).toContain('hello world');

    expect(time3).toBeTruthy();

    expect(page4).toContain(time3);
  });

  test('invalid cache snapshot', async () => {
    const { hydrateCache } = await createTestClient();

    expect(() => hydrateCache({ cacheSnapshot: 'invalid' })).toThrow(
      new GQtyError('Unrecognized snapshot format.')
    );
  });

  test('empty cache snapshot', async () => {
    const { hydrateCache, schema: cache } = await createTestClient();

    const cacheSnapshot1 = JSON.stringify(cache);

    expect(() => hydrateCache({ cacheSnapshot: JSON.stringify({}) })).toThrow(
      new GQtyError('Unrecognized snapshot format.')
    );

    const cacheSnapshot2 = JSON.stringify(cache);

    expect(cacheSnapshot1).toBe(cacheSnapshot2);
  });

  test('empty render function', async () => {
    const { prepareRender } = await createTestClient();

    const { cacheSnapshot } = await prepareRender(() => {});

    expect(cacheSnapshot).toStrictEqual([{}]);
  });
});
