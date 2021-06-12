export const config: import('bob-esbuild').BobConfig = {
  tsc: {
    dirs: ['packages/*', 'examples/mercurius'],
  },
  verbose: true,
};
