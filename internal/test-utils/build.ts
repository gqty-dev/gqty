// esbuild --bundle --minify --sourcemap --outdir=dist src/index.ts

import { build, type BuildOptions } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import tsc from 'typescript';
import packageJson from './package.json';

fs.rmSync('dist/', { force: true, recursive: true });

const baseOptions: BuildOptions = {
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  }),
  minify: true,
  platform: 'node',
  target: 'es2020',
};

// Build ESM module
build({
  ...baseOptions,
  format: 'esm',
  outfile: 'dist/index.mjs',
});

// Build CommonJS module
build({
  ...baseOptions,
  format: 'cjs',
  outfile: 'dist/index.cjs',
});

// tsc --emitDeclarationOnly
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

// Copy project files
for (const file of ['../../LICENSE', '../../README.md', 'package.json']) {
  fs.copyFileSync(
    path.normalize(path.join(import.meta.dirname ?? '.', file)),
    path.join('dist', path.basename(file))
  );
}
