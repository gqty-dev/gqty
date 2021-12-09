const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.json');
const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/../../',
});

process.env.TS_JEST_HOOKS = require.resolve('./tsJestHooks.js');

/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
const defaultConfig = {
  globals: {
    'ts-jest': {
      tsconfig: require.resolve('./test/tsconfig.json'),
      isolatedModules: true,
    },
  },
  preset: 'ts-jest',
  transform: { '\\.[jt]sx?$': 'ts-jest' },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  modulePathIgnorePatterns: ['/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.test.tsx'],
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['/node_modules/', '/test/generated'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts', './src/**/*.tsx', '!**/*.d.ts'],
  testTimeout: 10000,
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
  restoreMocks: true,
  moduleNameMapper,
};

exports.default = defaultConfig;

exports.getConfig = function getConfig(
  /**
   * @type {import("@jest/types").Config.InitialOptions}
   */
  config = {}
) {
  /**
   * @type {import("@jest/types").Config.InitialOptions}
   */
  const newConfig = {
    ...defaultConfig,
    ...config,
  };

  return newConfig;
};
