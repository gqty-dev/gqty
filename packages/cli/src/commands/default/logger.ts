import chalk from 'chalk';

/**
 * When false, triggers a new line before the next non-progress log.
 */
let isNewline = true;
let lastProgressLength = 0;

const normalMessage = (message?: any, ...optionalParams: any[]): void => {
  if (!isNewline) {
    isNewline = true;
    console.log('');
  }

  return console.log(message, ...optionalParams);
};

const progressMessage = (message: string) => {
  isNewline = false;

  const result = process.stdout.write(
    `\r${message}`.padEnd(lastProgressLength, ' ')
  );

  lastProgressLength = message.length + 1;

  return result;
};

export const logger = {
  error(...args: unknown[]) {
    return normalMessage(chalk.red('✗'), ...args);
  },
  warn(...args: unknown[]) {
    return normalMessage(chalk.yellow('!'), ...args);
  },
  info(...args: unknown[]) {
    return normalMessage(chalk.cyan('i'), ...args);
  },
  success(...args: unknown[]) {
    return normalMessage(chalk.green('✔'), ...args);
  },

  errorProgress(message: string) {
    return progressMessage(chalk.red('✗') + ' ' + message);
  },
  warnProgress(message: string) {
    return progressMessage(chalk.yellow('!') + ' ' + message);
  },
  infoProgress(message: string) {
    return progressMessage(chalk.cyan('i') + ' ' + message);
  },
  successProgress(message: string) {
    return progressMessage(chalk.green('✔') + ' ' + message);
  },
};
