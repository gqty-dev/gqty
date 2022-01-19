import { useGenerateGQty } from '@gqty/cli/envelop';
import { CreateApp, gql } from '@graphql-ez/nextjs';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezSchema } from '@graphql-ez/plugin-schema';

const ez = CreateApp({
  envelop: {
    plugins: [useGenerateGQty()],
  },
  ez: {
    plugins: [
      ezCodegen({
        outputSchema: true,
      }),
      ezSchema(),
    ],
  },
});

ez.registerTypeDefs(gql`
  type Query {
    page(a: String): Page!
  }

  type Page {
    pageBuilder: PageBuilder!
  }

  type PageBuilder {
    modules: [Module!]!
  }

  type Foo {
    bar: String
  }

  type A {
    foo: Foo
  }

  type B {
    foo: Foo
  }

  type C {
    foo: Foo
  }

  union Module = A | B | C
`);

ez.registerResolvers({
  Query: {
    page() {
      return {
        pageBuilder: {
          modules: [
            {
              __typename: 'B',
            },
            {
              __typename: 'C',
            },
          ],
        },
      };
    },
  },
  Module: {
    __resolveType(parent) {
      return parent.__typename || null;
    },
  },
  A: {
    foo() {
      return null;
      // return {
      //   bar: 'foo',
      // };
    },
  },
  B: {
    foo() {
      return {
        bar: 'foo',
      };
    },
  },
  C: {
    foo() {
      return {
        bar: 'foo',
      };
    },
  },
});

export default ez.buildApp().apiHandler;
