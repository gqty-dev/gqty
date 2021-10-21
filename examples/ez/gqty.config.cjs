/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  enumsAsStrings: false,
  react: false,
  scalarTypes: { DateTime: 'string', ExampleScalar: 'string' },
  preImport: '',
  introspection: { endpoint: './schema.gql' },
  destination: './src/generated/gqty.ts',
  subscriptions: false,
};

module.exports = config;
