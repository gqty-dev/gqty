// Credit: https://github.com/t3-oss/create-t3-app/blob/next/cli/src/utils/getUserPkgManager.ts

import { existsSync } from 'node:fs';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export const getUserPackageManager: () => PackageManager = () => {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent?.startsWith('yarn') || existsSync('yarn.lock')) {
    return 'yarn';
  } else if (userAgent?.startsWith('pnpm') || existsSync('pnpm-lock.yaml')) {
    return 'pnpm';
  } else if (userAgent?.startsWith('bun') || existsSync('bun.lockb') || existsSync('bun.lock')) {
    return 'bun';
  } else {
    return 'npm';
  }
};
