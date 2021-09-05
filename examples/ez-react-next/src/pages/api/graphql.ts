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
              user: User!
            }
            type User {
              id: ID!
              users: [User!]!
            }
          `,
          resolvers: {
            Query: {
              hello() {
                return 'Hello World';
              },
              user() {
                return {
                  id: '1',
                  users: [],
                };
              },
            },
          },
        },
      }),
    ],
  },
});

export default buildApp().apiHandler;
