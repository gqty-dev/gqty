import { CreateApp } from '@graphql-ez/nextjs';
import { ezSchema, gql } from '@graphql-ez/plugin-schema';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezGraphiQLIDE } from '@graphql-ez/plugin-graphiql';
import { inspectWriteGenerate } from '@gqty/cli';

const { buildApp } = CreateApp({
  ez: {
    plugins: [
      ezGraphiQLIDE(),
      ezCodegen({
        outputSchema: true,
        config: {
          onFinish() {
            inspectWriteGenerate().catch(console.error);
          },
        },
      }),
      ezSchema({
        schema: {
          typeDefs: gql`
            type Query {
              hello: String!
            }
          `,
          resolvers: {
            Query: {
              hello() {
                return 'Hello World';
              },
            },
          },
        },
      }),
    ],
  },
});

export default buildApp().apiHandler;
