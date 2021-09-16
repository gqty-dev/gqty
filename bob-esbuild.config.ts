import { sep } from 'path';

const isCLIPackage = process.cwd().endsWith(sep + 'cli');

export const config: import('bob-esbuild').BobConfig = {
  tsc: {
    dirs: ['packages/*'],
  },
  verbose: true,
  esbuildPluginOptions: isCLIPackage
    ? {
        // Check https://github.com/evanw/esbuild/issues/1146
        target: 'node13.2',
      }
    : undefined,
};
