import { buildTsc } from 'bob-esbuild';
import { writePackageJson } from 'bob-esbuild/config/packageJson';
import { buildCode } from 'bob-ts';
import { build } from 'esbuild';
import { promises as fs } from 'fs';
import pkg from './package.json';

async function main() {
  await fs.rm('dist', { recursive: true }).catch((e) => {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  });

  const tscPromise = Promise.allSettled([buildTsc()]);

  await fs.mkdir('dist', { recursive: true });

  await Promise.all([
    buildCode({
      entryPoints: ['./src/bin.ts'],
      clean: false,
      format: 'esm',
      outDir: 'dist',
      target: 'node16',
      esbuild: {
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
        minify: true,
      },
      sourcemap: false,
      external: ['./deps.js'],
      rollup: {
        banner: '#!/usr/bin/env node\n',
      },
    }),
    build({
      entryPoints: ['./src/deps.ts'],
      bundle: true,
      format: 'cjs',
      outfile: 'dist/deps.js',
      target: 'node16',
      platform: 'node',
      minify: true,
      external: ['graphql'],
    }),
    fs.copyFile('LICENSE', 'dist/LICENSE'),
    fs.copyFile('README.md', 'dist/README.md'),
    writePackageJson({
      packageJson: {
        ...pkg,
        bin: {
          gqty: './bin.mjs',
        },
      },
      distDir: 'dist',
    }),
  ]);

  await Promise.all([
    buildCode({
      entryPoints: [
        './src/inspectWriteGenerate.ts',
        './src/envelop.ts',
        './src/index.ts',
      ],
      clean: false,
      format: 'interop',
      outDir: 'dist',
      target: 'node16',
      esbuild: {
        minify: true,
      },
      sourcemap: false,
      external: ['./deps.js'],
      keepDynamicImport: false,
      rollup: {
        interop: 'esModule',
      },
    }),
  ]);

  {
    const [tscResult] = await tscPromise;

    if (tscResult.status === 'rejected') {
      throw tscResult.reason;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
