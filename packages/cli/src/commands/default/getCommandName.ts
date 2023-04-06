import { getUserPackageManager } from './getUserPackageManager';

export const getCommandName = () => {
  switch (getUserPackageManager()) {
    case 'npm': {
      return 'npx @gqty/cli';
    }
    case 'pnpm': {
      return 'pnpm dlx @gqty/cli';
    }
    case 'yarn': {
      return 'yarn dlx @gqty/cli';
    }
    default: {
      return 'gqty';
    }
  }
};
