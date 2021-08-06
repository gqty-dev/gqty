import './scheduler';

import assert from 'assert';
import faker from 'faker';
import Fastify from 'fastify';
import { range } from 'lodash-es';

import { buildApp } from './app';

faker.seed(2021);

const app = Fastify({
  logger: true,
});

app.register(
  buildApp({
    async prepare({ registerModule, gql }) {
      await import('./services');
      registerModule(
        gql`
          input CursorConnectionArgs {
            first: NonNegativeInt
            after: NonEmptyString

            last: NonNegativeInt
            before: NonEmptyString
          }

          type CursorPageInfo {
            hasNextPage: Boolean!
            hasPreviousPage: Boolean!
            startCursor: NonEmptyString
            endCursor: NonEmptyString
          }

          type Query {
            hello: String!
            namesList(n: Int = 10): [String!]!
          }
          type Mutation {
            hello: String!
          }
        `,
        {
          resolvers: {
            Query: {
              hello() {
                return 'Hello World';
              },
              namesList(_root, { n }) {
                assert(n <= 10000, 'You can only request up to 10.000 names.');
                faker.seed(2021);
                return range(n).map(() => faker.name.firstName());
              },
            },
            Mutation: {
              hello() {
                return 'Hello World';
              },
            },
          },
        }
      );
    },
  }).fastifyPlugin
);

app.get('/', (_req, res) => {
  res.type('text/html').send(`
  <html>
    <head>
      <link rel="icon" href="https://gqless.com/icon/favicon-96x96.png" />
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
    </head>
    <body style="text-align: center; font-size: 3rem; font-weight: bold; font-family: 'Open Sans', sans-serif; display: flex; align-items: center; justify-content: center;">
      <nav>
        <ul style="list-style: none; padding-left: 0px;">
          <li style="display: flex; align-items: center; justify-content: center; border: 2px solid black; border-radius: 5px; padding: 5px;">
            <img onclick="window.location='/altair'" style="margin: 10px; cursor: pointer;" src="https://raw.githubusercontent.com/imolorhe/altair/staging/packages/altair-app/src/assets/img/altair_logo_128.png" />
            <a style="color: black; text-decoration: none;" href="/altair">Altair GraphQL Playground</a>
          </li>
          <br />
          <br />
          <li style="display: flex; align-items: center; justify-content: center; border: 2px solid black; border-radius: 5px; padding: 5px;">
            <img onclick="window.location='/voyager'" style="margin: 10px; object-fit: cover; border-radius: 10px; cursor: pointer;" width="100px" height="100px" src="https://github.com/APIs-guru/graphql-voyager/raw/master/docs/cover.png" />
            <a style="color: black; text-decoration: none;" href="/voyager">Interactive GraphQL Visualization - GraphQL Voyager</a>
          </li>
        </ul>
      </nav>
    </body>
  </html>
  `);
});

app.listen(8090, '0.0.0.0', (err) => {
  if (err) console.error(err);
});
