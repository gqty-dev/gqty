const esModules = ['@react-hookz/web', '@ver0/deep-equal']
  .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

module.exports = require('test-utils/jest.config.js').getConfig({
  setupFiles: ['./jest.setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`node_modules/(?!.*(${esModules}))`],
});
