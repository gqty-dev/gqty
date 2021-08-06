import { BuildContextArgs, CreateApp, InferContext } from '@graphql-ez/fastify';
import { ezAltairIDE } from '@graphql-ez/plugin-altair';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezGraphQLModules } from '@graphql-ez/plugin-modules';
import { ezScalars } from '@graphql-ez/plugin-scalars';
import { ezVoyager } from '@graphql-ez/plugin-voyager';
import { ezWebSockets } from '@graphql-ez/plugin-websockets';

import { prisma } from './db';
import { VerifyAuthToken } from './services/auth/jwt';

function buildContext({ req }: BuildContextArgs) {
  return {
    user: req.headers.authorization
      ? VerifyAuthToken(req.headers.authorization)
      : null,
    prisma,
  };
}

declare module 'graphql-ez' {
  interface EZContext extends InferContext<typeof buildContext> {}
}

export const { buildApp, registerModule, gql } = CreateApp({
  ez: {
    plugins: [
      ezAltairIDE({
        subscriptionsEndpoint: 'wss://gqless-examples-api.pablosz.tech/graphql',
        instanceStorageNamespace: 'gqty-examples',
      }),
      ezVoyager(),
      ezGraphQLModules(),
      ezCodegen({
        config: {
          enumsAsTypes: true,
          scalars: {
            ID: 'number',
            DateTime: 'string | Date',
            NonNegativeInt: 'number',
            NonEmptyString: 'string',
            EmailAddress: 'string',
          },
        },
        outputSchema: true,
      }),
      ezScalars({
        NonNegativeInt: true,
        NonEmptyString: true,
        DateTime: true,
        EmailAddress: true,
      }),
      ezWebSockets(),
    ],
  },
  buildContext,
  cors: true,
});
