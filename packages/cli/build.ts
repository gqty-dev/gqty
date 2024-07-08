import { buildTsc } from 'bob-esbuild';
import { writePackageJson } from 'bob-esbuild/config/packageJson';
import { buildCode } from 'bob-ts';
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
      rollup: {
        banner: '#!/usr/bin/env node\n',
      },
    }),
    buildCode({
      entryPoints: ['./src/envelop.ts', './src/index.ts'],
      clean: false,
      outDir: 'dist',
      format: 'interop',
      target: 'node16',
      external: ['graphql'],
      esbuild: {
        minify: true,
      },
      sourcemap: false,
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
