/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  enumsAsStrings: true,
  react: true,
  scalarTypes: {
    DateTime: 'string',
    NonNegativeInt: 'number',
    NonEmptyString: 'string',
    EmailAddress: 'string',
  },
  preImport: '',
  introspection: {
    endpoint: 'https://examples-api.gqty.dev/graphql',
    headers: {},
  },
  destination: './src/gqty/index.ts',
  subscriptions: true,
  javascriptOutput: false,
};

module.exports = config;
