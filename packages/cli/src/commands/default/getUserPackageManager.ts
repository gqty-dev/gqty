// Credit: https://github.com/t3-oss/create-t3-app/blob/next/cli/src/utils/getUserPkgManager.ts

import { existsSync } from 'node:fs';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export const getUserPackageManager: () => PackageManager | undefined = () => {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith('yarn') || existsSync('yarn.lock')) {
      return 'yarn';
    } else if (userAgent.startsWith('pnpm') || existsSync('pnpm-lock.yaml')) {
      return 'pnpm';
    } else {
      return 'npm';
    }
  }

  return;
};
