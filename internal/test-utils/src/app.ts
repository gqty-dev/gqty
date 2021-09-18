import {
  createDeferredPromise,
  FastifyAppOptions,
  PromiseType,
} from '@graphql-ez/fastify';
import { CreateTestClient, GlobalTeardown } from '@graphql-ez/fastify-testing';
import { CodegenOptions, ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezSchema, EZSchemaOptions } from '@graphql-ez/plugin-schema';
import { ezWebSockets } from '@graphql-ez/plugin-websockets';
import { InMemoryPubSub } from 'graphql-ez/pubsub';
import { inspect } from 'util';

inspect.defaultOptions.depth = null;

typeof afterAll !== 'undefined' && afterAll(GlobalTeardown);

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
    ezPlugins.push(ezWebSockets('legacy'));
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
export * as fastify from 'fastify';
