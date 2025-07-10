import type { ProjectManifest } from '@pnpm/types';
import type { GQtyConfig } from '../../config';
import { inquirer } from '../../deps';
import {
  getUserPackageManager,
  type PackageManager,
} from './getUserPackageManager';

export const promptInstall = async (configuration: GQtyConfig) => {
  const command = getUserPackageManager() ?? 'npm';
  const pkgs = getInstallPackages(configuration, command);
  const args = getInstallCommand(command).concat(pkgs);
  const { spawnSync } = await import('child_process');

  const install = await inquirer.confirm({
    message: `Do you want us to run "${command} ${args[0]}" for you?`,
    default: true,
  });

  if (!install) return;

  spawnSync(command, args, { stdio: 'inherit' });
};

/**
 * Install missing packages with the current package manager.
 */
export const runInstall = async (
  { dependencies, devDependencies }: ProjectManifest,
  configuration: GQtyConfig
) => {
  const command = getUserPackageManager() ?? 'npm';
  const deps = new Set([
    ...Object.keys(dependencies ?? {}),
    ...Object.keys(devDependencies ?? {}),
  ]);
  const pkgs = getInstallPackages(configuration, command).filter(
    (pkg) => !deps.has(pkg)
  );

  if (pkgs.length === 0) return;

  const args = getInstallCommand(command).concat(pkgs);
  const { spawnSync } = await import('child_process');

  spawnSync(command, args, { stdio: 'inherit' });
};

const getInstallCommand = (packager: PackageManager) => {
  switch (packager) {
    case 'bun': {
      return ['add', '--dev'];
    }
    default:
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

const getInstallPackages = (
  configuration: GQtyConfig,
  command: PackageManager
) => {
  const packages = ['gqty', 'graphql'];

  if (configuration.frameworks?.includes('react')) {
    packages.push('@gqty/react');
  }

  if (configuration.frameworks?.includes('solid-js')) {
    packages.push('@gqty/solid');
  }

  if (configuration.subscriptions === true) {
    packages.push('graphql-ws');
  } else if (configuration.subscriptions) {
    packages.push(configuration.subscriptions);
  }

  if (
    !configuration.javascriptOutput &&
    // Bun has built-in typescript
    command !== 'bun'
  ) {
    packages.push('typescript');
  }

  return packages;
};
