export default {
  files: ['**/*.test.ts'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=bob-tsm'],
};
