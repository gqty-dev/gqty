import { useGenerateGQty } from '@gqty/cli/envelop';
import { CreateApp } from '@graphql-ez/nextjs';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezGraphiQLIDE } from '@graphql-ez/plugin-graphiql';
import { ezSchema, gql } from '@graphql-ez/plugin-schema';

const { buildApp } = CreateApp({
  ez: {
    plugins: [
      ezGraphiQLIDE(),
      ezCodegen({
        outputSchema: true,
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
  envelop: {
    plugins: [useGenerateGQty()],
  },
});

export default buildApp().apiHandler;
