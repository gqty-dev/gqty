import { readFileSync } from 'fs';
import { sep } from 'path';

const isCLIPackage = process.cwd().endsWith(sep + 'cli');

export const config: import('bob-esbuild').BobConfig = {
  tsc: {
    dirs: ['packages/*'],
  },
  verbose: true,
  manualRewritePackageJson: {
    // Keep the expo/metro-friendly condition order when the package.json is
    // rewritten for publication. Otherwise the generated manifest puts the ESM
    // entry first and native apps pull the web bundle.
    '@gqty/react': (pkg) => {
      const normalizePath = (value?: string) =>
        value?.replace('./dist/', './');

      const deriveNativePath = (value?: string) =>
        normalizePath(value)?.replace(/(\.m?js)$/u, '.native$1');

      const preserveOrder = (
        entry: Record<string, unknown> | string | undefined
      ) => {
        if (entry == null || typeof entry === 'string') return entry;

        const candidate =
          (entry.require as string | undefined) ??
          (entry.import as string | undefined);

        const nativePath = deriveNativePath(candidate);

        const orderedEntries: [string, unknown][] = [];

        if (nativePath) orderedEntries.push(['react-native', nativePath]);

        for (const [key, value] of Object.entries(entry)) {
          if (key === 'react-native') continue;
          orderedEntries.push([key, value]);
        }

        return Object.fromEntries(orderedEntries);
      };

      const rewrittenExports =
        pkg.exports &&
        Object.fromEntries(
          Object.entries(pkg.exports).map(([key, value]) => [
            key,
            preserveOrder(value as any),
          ])
        );

      const nativeMain = deriveNativePath(pkg.main);

      return nativeMain || rewrittenExports
        ? {
            ...pkg,
            ...(nativeMain ? { 'react-native': nativeMain } : null),
            ...(rewrittenExports ? { exports: rewrittenExports } : null),
          }
        : pkg;
    },
  },
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
