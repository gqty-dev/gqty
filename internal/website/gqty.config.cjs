const assert = require('assert');

require('dotenv').config();

const { GITHUB_PAT } = process.env;
assert(GITHUB_PAT, 'GitHub personal access token (classic) is required for GraphQL API.');

/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: true,
  scalarTypes: {
    Base64String: 'string',
    Date: 'Date',
    DateTime: 'Date',
    GitObjectID: 'string',
    GitSSHRemote: 'string',
    GitTimestamp: 'string',
    HTML: 'string',
    URI: 'string',
    X509Certificate: 'string',
  },
  introspection: {
    endpoint: 'https://api.github.com/graphql',
    headers: {
      authorization: `Bearer ${GITHUB_PAT}`,
    },
  },
  destination: './src/gqty/index.ts',
  subscriptions: false,
  javascriptOutput: false,
  enumsAsConst: false,
};

module.exports = config;
