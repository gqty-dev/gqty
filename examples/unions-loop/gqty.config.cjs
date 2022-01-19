/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: true,
  scalarTypes: { DateTime: 'string' },
  introspection: {
    endpoint: 'SPECIFY_ENDPOINT_OR_SCHEMA_FILE_PATH_HERE',
    headers: {},
  },
  destination: './src/gqty/index.ts',
  subscriptions: false,
  javascriptOutput: false,
};

module.exports = config;
