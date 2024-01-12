import {
  createDeferredPromise,
  type FastifyAppOptions,
  type PromiseType,
} from '@graphql-ez/fastify';
import { CreateTestClient, GlobalTeardown } from '@graphql-ez/fastify-testing';
import { ezCodegen, type CodegenOptions } from '@graphql-ez/plugin-codegen';
import { ezSchema, type EZSchemaOptions } from '@graphql-ez/plugin-schema';
import { ezWebSockets } from '@graphql-ez/plugin-websockets';
import { InMemoryPubSub } from 'graphql-ez/pubsub';
import { inspect } from 'util';

inspect.defaultOptions.depth = null;

typeof afterAll !== 'undefined' && afterAll(() => void GlobalTeardown());

const codegenPromises: Promise<void>[] = [];

typeof afterAll !== 'undefined' && afterAll(() => Promise.all(codegenPromises));

interface PubSubCtx {
  pubsub: InMemoryPubSub;
}
declare module 'graphql-ez' {
  interface EZContext extends PubSubCtx {}
}

export type TestApp = PromiseType<ReturnType<typeof CreateTestClient>>;

export async function createTestApp(
  {
    schema,
    codegen,
    ...appOptions
  }: Omit<FastifyAppOptions, 'schema'> & {
    schema?: EZSchemaOptions['schema'];
    codegen?: CodegenOptions;
  },
  {
    codegenPath,
    websockets,
  }: {
    codegenPath?: string;
    websockets?: boolean;
  } = {}
): Promise<TestApp> {
  const options = { ...appOptions };

  const ezPlugins = [...(options.ez?.plugins || [])];

  const envelopPlugins = [...(options.envelop?.plugins || [])];

  const pubsub = new InMemoryPubSub();

  envelopPlugins.push({
    onContextBuilding({ extendContext }) {
      extendContext({
        pubsub,
      });
    },
  });

  let codegenDonePromise: Promise<void> | undefined;

  if (codegenPath) {
    const codegenDone = createDeferredPromise();
    codegenDonePromise = codegenDone.promise;

    codegenPromises.push(codegenDonePromise);

    ezPlugins.push(
      ezCodegen({
        config: {
          targetPath: codegenPath,
          onFinish() {
            codegenDone.resolve();
          },
          onError(err) {
            codegenDone.reject(err);
          },
        },
        enableCodegen: true,
      })
    );
  }

  ezPlugins.push(
    ezSchema({
      schema,
    })
  );

  if (websockets) {
    ezPlugins.push(ezWebSockets());
  }

  const client = await CreateTestClient({
    ...options,
    ez: { plugins: ezPlugins },
    envelop: {
      plugins: envelopPlugins,
    },
  });

  await codegenDonePromise;
  return client;
}

export * from '@graphql-ez/fastify';
