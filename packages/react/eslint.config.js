const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const noLodash = require('eslint-plugin-you-dont-need-lodash-underscore');
const typescript = require('typescript-eslint');

const noLodashConfig = new FlatCompat().config(noLodash.configs.compatible);

/** @type {import("eslint").Linter.FlatConfig} */
module.exports = [
  js.configs.recommended,
  typescript.configs.eslintRecommended,
  ...typescript.configs.recommended,
  ...noLodashConfig,
  { ignores: ['dist/', 'coverage/', '*.config.js'] },
];
