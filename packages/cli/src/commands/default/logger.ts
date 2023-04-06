import chalk from 'chalk';

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red('✗'), ...args);
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow('!'), ...args);
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan('i'), ...args);
  },
  success(...args: unknown[]) {
    console.log(chalk.green('✔'), ...args);
  },

  errorProgress(message: string) {
    process.stdout.write(progressMessage(chalk.red('✗') + ' ' + message));
  },
  warnProgress(message: string) {
    process.stdout.write(progressMessage(chalk.yellow('!') + ' ' + message));
  },
  infoProgress(message: string) {
    process.stdout.write(progressMessage(chalk.cyan('i') + ' ' + message));
  },
  successProgress(message: string) {
    process.stdout.write(progressMessage(chalk.green('✔') + ' ' + message));
  },
};

const progressMessage = (message: string) =>
  `\r${message}`.padEnd((process.stdout.columns ?? 0) - 2, ' ');
