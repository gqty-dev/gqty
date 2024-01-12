import { type PackageJSON } from 'bob-esbuild/config/packageJson';
import { type GQtyConfig } from '../../config';
import { inquirer } from '../../deps';
import {
  getUserPackageManager,
  type PackageManager,
} from './getUserPackageManager';

export const promptInstall = async (configuration: GQtyConfig) => {
  const packages = getInstallPackages(configuration);
  const command = getUserPackageManager() ?? 'npm';
  const args = getInstallCommand(command).concat(packages);

  const { install } = await inquirer.prompt<{ install: boolean }>({
    type: 'confirm',
    name: 'install',
    message: `Do you want us to run "${command} ${args[0]}" for you?`,
    default: true,
  });

  if (!install) return;

  const { spawnSync } = await import('child_process');

  spawnSync(command, args, { stdio: 'inherit' });
};

/**
 * Install missing packages with the current package manager.
 */
export const runInstall = async (
  { dependencies, devDependencies }: PackageJSON,
  configuration: GQtyConfig
) => {
  const deps = new Set([
    ...Object.keys(dependencies ?? {}),
    ...Object.keys(devDependencies ?? {}),
  ]);
  const pkgs = getInstallPackages(configuration).filter(
    (pkg) => !deps.has(pkg)
  );

  if (pkgs.length === 0) return;

  const command = getUserPackageManager() ?? 'npm';
  const args = getInstallCommand(command).concat(pkgs);
  const { spawnSync } = await import('child_process');

  spawnSync(command, args, { stdio: 'inherit' });
};

const getInstallCommand = (packager: PackageManager) => {
  switch (packager) {
    case 'npm': {
      return ['install', '--save-dev'];
    }
    case 'pnpm': {
      return ['add', '--save-dev'];
    }
    case 'yarn': {
      return ['add', '--dev'];
    }
  }
};

const getInstallPackages = (configuration: GQtyConfig) => {
  const packages = ['gqty', 'graphql'];

  if (configuration.react) {
    packages.push('@gqty/react');
  }

  if (configuration.subscriptions === true) {
    packages.push('graphql-ws');
  } else if (configuration.subscriptions) {
    packages.push(configuration.subscriptions);
  }

  if (!configuration.javascriptOutput) {
    packages.push('typescript');
  }

  return packages;
};
