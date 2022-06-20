import { buildTsc } from 'bob-esbuild';
import { writePackageJson } from 'bob-esbuild/config/packageJson';
import pkg from './package.json';

await buildTsc();

await writePackageJson({
  packageJson: pkg,
  distDir: 'dist',
  skipValidate: true,
});
