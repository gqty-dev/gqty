// esbuild --bundle --minify --sourcemap --outdir=dist src/index.ts

import { build, type BuildOptions } from 'esbuild';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import tsc from 'typescript';
import packageJson from './package.json';

await fs.rm('dist/', { force: true, recursive: true });

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

const baseOptions: BuildOptions = {
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: Object.keys(packageJson.peerDependencies ?? {}),
  minify: true,
  target: 'es2020',
};

await Promise.all([
  // Build ES module
  build({
    ...baseOptions,
    format: 'esm',
    outfile: 'dist/index.mjs',
  }),

  // Build CommonJS module
  build({
    ...baseOptions,
    format: 'cjs',
    outfile: 'dist/index.cjs',
  }),

  // Copy project files
  ...['../../LICENSE', '../../README.md', 'package.json'].map((file) =>
    fs.copyFile(
      path.normalize(path.join(import.meta.dirname ?? '.', file)),
      path.join('dist', path.basename(file))
    )
  ),
]);
