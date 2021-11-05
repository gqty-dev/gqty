/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  enumsAsStrings: false,
  react: false,
  scalarTypes: { DateTime: 'string', Upload: 'File' },
  preImport: '',
  introspection: { endpoint: 'SPECIFY_ENDPOINT_OR_SCHEMA_FILE_PATH_HERE' },
  destination: './src/graphql/gqty.ts',
};

module.exports = config;
