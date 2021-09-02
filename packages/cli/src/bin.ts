import { program } from 'commander';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defaultConfig, inspectWriteGenerate, __innerState } from './index';

__innerState.isCLI = true;

program
  .version(
    JSON.parse(
      readFileSync(
        resolve(dirname(fileURLToPath(import.meta.url)), '../package.json'),
        {
          encoding: 'utf-8',
        }
      )
    ).version
  )
  .description('CLI for gqty');

program
  .command('generate [endpoint] [destination]')
  .option('--react', 'Create React client')
  .description(
    `Inspect or read from a file a GraphQL Schema and generate the gqty client in the specified directory (./src/generated/graphql.ts by default).
EXAMPLE 1: "gqty generate ./schema.gql --react" 
EXAMPLE 2: "gqty generate http://localhost:3000/graphql src/gqty/index.ts"
EXAMPLE 3 (Configuration file): "gqty generate"`
  )
  .action(async (endpoint, destination, opts) => {
    let react;
    if (opts.react != null) {
      react = defaultConfig.react =
        typeof opts.react === 'boolean' ? opts.react : !!opts.react;
    }

    await inspectWriteGenerate({
      endpoint,
      destination,
      cli: true,
      generateOptions: {
        react,
      },
    }).catch((err) => {
      if (err instanceof Error) delete err.stack;
      console.error(err);
      process.exit(1);
    });
    process.exit(0);
  });

program.parse(process.argv);
