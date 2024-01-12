import { readFileSync } from 'fs';
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
        define: {
          __VERSION__: JSON.stringify(
            JSON.parse(readFileSync('./package.json', 'utf-8')).version
          ),
        },
      }
    : undefined,
  outputOptions: {
    interop(module) {
      switch (module) {
        case 'react-ssr-prepass':
        case 'react':
          return 'esModule';
        default:
          return 'auto';
      }
    },
  },
};
