import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  target: 'es2020',
  clean: true,
  entryPoints: ['src/index.ts'],
  skipNodeModulesBundle: true,
  splitting: false,
  silent: true,
});
