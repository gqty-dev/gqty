import { writePackageJson } from 'bob-esbuild/config/packageJson';
import { buildCode } from 'bob-ts';
import * as fs from 'fs';
import path from 'path';
import tsc from 'typescript';
import packageJson from './package.json';

fs.rmSync('dist', { force: true, recursive: true });

// tsc --emitDeclarationOnly
// Note: Creates the target directory, and serves as a pre-build typecheck.
tsc
  .createProgram(['src/index.ts'], {
    baseUrl: '.',
    declaration: true,
    emitDeclarationOnly: true,
    forceConsistentCasingInFileNames: true,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    outDir: 'dist',
    rootDir: 'src',
    skipLibCheck: true,
    strict: true,
    target: tsc.ScriptTarget.ESNext,
    verbatimModuleSyntax: true,
  })
  .emit(undefined, undefined, undefined, true);

/* await */ Promise.all([
  buildCode({
    entryPoints: ['./src/bin.ts'],
    clean: false,
    format: 'esm',
    outDir: 'dist',
    target: 'es2020',
    esbuild: {
      define: {
        __VERSION__: JSON.stringify(packageJson.version),
      },
      minify: true,
    },
    sourcemap: false,
    rollup: {
      banner: '#! /usr/bin/env node\n',
    },
  }),

  buildCode({
    entryPoints: ['./src/envelop.ts', './src/index.ts'],
    clean: false,
    outDir: 'dist',
    format: 'interop',
    target: 'es2020',
    external: ['graphql'],
    esbuild: {
      minify: true,
    },
    sourcemap: false,
  }),

  // Copy project files
  ...['../../LICENSE', '../../README.md'].map((file) =>
    fs.promises.copyFile(file, path.join('dist', path.basename(file)))
  ),
  writePackageJson({
    packageJson: {
      ...packageJson,
      bin: {
        gqty: './bin.mjs',
      },
    },
    distDir: 'dist',
  }),
]);
