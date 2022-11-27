module.exports = require('test-utils/jest.config.js').getConfig({
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testEnvironment: 'jsdom',
});
