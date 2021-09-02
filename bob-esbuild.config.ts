import { sep } from 'path';

const isCLIPackage = process.cwd().endsWith(sep + 'cli');

export const config: import('bob-esbuild').BobConfig = {
  tsc: {
    dirs: ['packages/*', 'examples/mercurius'],
  },
  verbose: true,
  esbuildPluginOptions: isCLIPackage
    ? {
        target: 'node12',
      }
    : undefined,
};
