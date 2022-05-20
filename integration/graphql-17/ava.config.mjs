export default {
  files: ['**/*.test.ts'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--require=bob-tsm', '--loader=bob-tsm'],
};
