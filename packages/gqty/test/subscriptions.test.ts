import { createDeferredPromise } from '../src/Utils';
import { createTestClient } from './utils';

describe('core#resolve', () => {
  it('should receive subscription data', async () => {
    const { resolve } = await createTestClient(undefined, undefined, {
      subscriptions: true,
    });

    const [data] = await Promise.all([
      (async () => {
        return resolve(({ subscription }) => {
          subscription.newNotification;
        });
      })(),
      (async () => {
        await new Promise((r) => setTimeout(r, 1000));
        await resolve(({ mutation }) =>
          mutation.sendNotification({
            message: 'THIS_IS_A_MESSAGE',
          })
        );
      })(),
    ]);

    expect(data).toMatchInlineSnapshot(`
      {
        "subscription": {
          "newNotification": "THIS_IS_A_MESSAGE",
        },
      }
    `);
  });
});

describe('core#subscribe', () => {
  it('should receive query changes', async () => {
    const { subscribe, resolve } = await createTestClient(
      undefined,
      undefined,
      { subscriptions: true }
    );
    const receivedData: any[] = [];

    let refetched = false;

    for await (const data of subscribe(({ query }) => query.nFetchCalls)) {
      receivedData.push(data);

      if (!refetched) {
        refetched = true;
        await resolve(({ query }) => query.nFetchCalls, {
          fetchPolicy: 'no-cache',
        });
      } else {
        break;
      }
    }

    expect(receivedData).toStrictEqual([1, 2]);
  });

  it('should work with mutations and subscriptions', async () => {
    const { subscribe, resolve } = await createTestClient(
      undefined,
      undefined,
      { subscriptions: true }
    );
    const receivedData: any[] = [];

    await Promise.all([
      (async () => {
        for await (const data of subscribe(
          ({ subscription }) => subscription.newNotification
        )) {
          receivedData.push(data);
          if (receivedData.length === 2) return;
        }
      })(),
      (async () => {
        await new Promise((r) => setTimeout(r, 100));
        await resolve(
          ({ mutation }) => mutation.sendNotification({ message: 'aaa' }),
          { fetchPolicy: 'no-cache' }
        );
        await resolve(
          ({ mutation }) => mutation.sendNotification({ message: 'bbb' }),
          { fetchPolicy: 'no-cache' }
        );
      })(),
    ]);

    expect(receivedData).toMatchObject(['aaa', 'bbb']);
  });

  it('should be abortable mid-flight', async () => {
    const { subscribe } = await createTestClient(undefined, undefined, {
      subscriptions: true,
    });

    for await (const _ of subscribe(
      ({ subscription }) => subscription.newNotification,
      {
        onSubscribe(unsubscribe) {
          unsubscribe();
        },
      }
    )) {
      // no-op
    }
  }, 1000);
});

describe('legacy subscriptions', () => {
  test('subscriptions with resolved', async () => {
    const { resolved, subscription, mutate } = await createTestClient(
      undefined,
      undefined,
      { subscriptions: true }
    );

    const unsubscribePromise = createDeferredPromise<() => Promise<void>>();
    const dataPromise = createDeferredPromise<string>();
    let unsubscribe: (() => Promise<void>) | undefined;

    try {
      await resolved(() => subscription.newNotification, {
        onSubscription(event) {
          unsubscribePromise.resolve(event.unsubscribe);

          switch (event.type) {
            case 'data': {
              if (event.data) dataPromise.resolve(event.data);
              break;
            }
            case 'with-errors': {
              console.error(event.error);
              unsubscribePromise.reject(event.error);
              dataPromise.reject(event.error);
              throw event.error;
            }
          }
        },
      });

      await unsubscribePromise.promise;

      await new Promise((r) => setTimeout(r, 10));

      await mutate(
        (mutation) => {
          return mutation.sendNotification({
            message: 'OK',
          });
        },
        {
          onComplete(data) {
            expect(data).toBe(true);
          },
        }
      );

      await dataPromise.promise.then((data) => expect(data).toBe('OK'));
    } finally {
      await Promise.allSettled([
        unsubscribePromise.promise.then((v) => v()),
        unsubscribe?.(),
      ]);
    }
  }, 5000);

  test('multiple subscriptions with resolved', async () => {
    const { resolved, subscription, mutate } = await createTestClient(
      undefined,
      undefined,
      { subscriptions: true }
    );

    const unsubscribePromise = createDeferredPromise();

    const dataPromise = createDeferredPromise<[string, string]>();
    let data1Done = false;
    const data2Promise = createDeferredPromise<[string, string]>();

    const unsubscribers = new Set<() => Promise<void>>();

    try {
      await resolved(
        () => {
          return {
            newHumanName: subscription.newHuman.name,
            newDogName: subscription.newDog.name,
          };
        },
        {
          onSubscription(event) {
            unsubscribers.add(event.unsubscribe);

            switch (event.type) {
              case 'start': {
                unsubscribePromise.resolve();
                break;
              }
              case 'data': {
                if (data1Done) {
                  data2Promise.resolve([
                    event.data.newHumanName,
                    event.data.newDogName,
                  ]);
                } else {
                  data1Done = true;
                  dataPromise.resolve([
                    event.data.newHumanName,
                    event.data.newDogName,
                  ]);
                }

                break;
              }
              case 'with-errors':
                console.error(event.error);
                unsubscribePromise.reject(event.error);
                dataPromise.reject(event.error);
                data2Promise.reject(event.error);
                throw event.error;
            }
          },
        }
      );

      await unsubscribePromise.promise;

      await new Promise((r) => setTimeout(r, 10));

      await mutate(
        (mutation) => {
          return mutation.humanMutation({
            nameArg: 'new_human',
          }).name;
        },
        {
          onComplete(data) {
            expect(data).toBe('new_human');
          },
        }
      );

      await dataPromise.promise.then((data) =>
        expect(data).toStrictEqual(['new_human', undefined])
      );

      await mutate(
        (mutation) => {
          return mutation.createDog({
            name: 'new_dog',
          }).name;
        },
        {
          onComplete(data) {
            expect(data).toBe('new_dog');
          },
        }
      );

      await data2Promise.promise.then((data) =>
        expect(data).toStrictEqual(['new_human', 'new_dog'])
      );
    } finally {
      unsubscribers.forEach((v) => v());
    }
  }, 5000);
});
