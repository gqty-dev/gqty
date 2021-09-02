import chalk from 'chalk';
import { execSync } from 'child_process';
import { globby } from 'globby';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

async function main() {
  const cwd = dirname(fileURLToPath(import.meta.url));
  const mjsFiles = await globby(['../packages/**/dist/*.mjs'], {
    cwd,
  });

  const ok = [];
  const fail = [];

  let i = 0;
  await Promise.all(
    mjsFiles.map((mjsFile) => {
      if (mjsFile.endsWith('bin.mjs')) {
        execSync(`node ${resolve(cwd, mjsFile)} --help`, {
          stdio: 'inherit',
        });

        return;
      }
      const mjsPath = `./${mjsFile}`;
      return import(mjsPath)
        .then(() => {
          ok.push(mjsPath);
        })
        .catch((err) => {
          const color = i++ % 2 === 0 ? chalk.magenta : chalk.red;
          console.error(color('\n\n-----\n' + i + '\n'));
          console.error(mjsPath, err);
          console.error(color('\n-----\n\n'));
          fail.push(mjsPath);
        });
    })
  );
  ok.length && console.log(chalk.blue(`${ok.length} OK: ${ok.join(' | ')}`));
  fail.length &&
    console.error(chalk.red(`${fail.length} Fail: ${fail.join(' | ')}`));

  if (fail.length) {
    console.error('\nFAILED');
    process.exit(1);
  } else if (ok.length) {
    console.error('\nOK');
    process.exit(0);
  } else {
    console.error('No files analyzed!');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
