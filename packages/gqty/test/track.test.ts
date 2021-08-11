import { waitForExpect } from 'test-utils';
import { createTestClient, sleep } from './utils';

describe('normal queries', () => {
  test('works', async () => {
    const { track, query, refetch } = await createTestClient();

    let nCalls = 0;

    let lastData: number | undefined;

    let error: unknown;

    const { stop, selections } = track(
      () => {
        ++nCalls;
        lastData = query.nFetchCalls;
      },
      {
        onError(err) {
          error = err;
        },
      }
    );

    expect(nCalls).toBe(1);

    await waitForExpect(() => {
      expect(lastData).toBe(1);
    });

    expect(nCalls).toBe(2);

    query.nFetchCalls = 44;

    await waitForExpect(() => {
      expect(lastData).toBe(44);
    });

    expect(nCalls).toBe(3);

    await refetch(query);

    await waitForExpect(() => {
      expect(lastData).toBe(2);
    });

    expect(nCalls).toBe(4);

    expect(selections.size).toBe(1);

    stop();

    const { stop: stop2 } = track(
      () => {
        ++nCalls;
        lastData = query.nFetchCalls;
      },
      {
        onError(err) {
          error = err;
        },
        refetch: true,
      }
    );

    expect(nCalls).toBe(5);

    await waitForExpect(() => {
      expect(lastData).toBe(3);
    });

    expect(nCalls).toBe(6);

    expect(error).toBe(undefined);

    stop2();
  });
});

describe('subscriptions', () => {
  test('works', async () => {
    const { track, mutate, subscription } = await createTestClient(
      undefined,
      undefined,
      {
        subscriptions: true,
      }
    );

    let lastData: unknown;
    let nCalls = 0;
    let error: unknown;

    const { stop } = track(
      (info) => {
        ++nCalls;

        if (info.type === 'initial') {
          expect(nCalls).toBe(1);
        } else {
          expect(nCalls).toBeGreaterThanOrEqual(2);
        }
        lastData = subscription.newNotification;
      },
      {
        onError(err) {
          error = err;
        },
      }
    );

    expect(nCalls).toBe(1);

    await sleep(1000);

    await mutate((mutation) =>
      mutation.sendNotification({
        message: 'first',
      })
    );

    await waitForExpect(() => {
      expect(lastData).toBe('first');
    });

    expect(nCalls).toBe(2);

    await mutate((mutation) =>
      mutation.sendNotification({
        message: 'second',
      })
    );

    await waitForExpect(() => {
      expect(lastData).toBe('second');
    });

    expect(nCalls).toBe(3);

    stop();

    expect(error).toBe(undefined);
  });
});
