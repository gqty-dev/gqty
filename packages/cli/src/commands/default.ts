import { type PackageJSON } from 'bob-esbuild/config/packageJson';
import type { Command } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { readFile, watch } from 'node:fs/promises';
import { type GQtyConfig } from '../config';
import { inquirer } from '../deps';
import { convertHeadersInput } from './default/convertHeadersInput';
import { fetchSchemas, isURL } from './default/fetchSchema';
import { generateClient } from './default/generateClient';
import { getCommandName } from './default/getCommandName';
import { logger } from './default/logger';
import { promptInstall, runInstall } from './default/promptInstall';

export type CommandOptions = {
  header?: string[];
  install?: boolean;
  react?: boolean;
  subscriptions?: string;
  target?: string;
  typescript?: boolean;
  watch: boolean;
};

export const addCommand = (command: Command) => {
  return command
    .name(getCommandName())
    .usage(`[options] [endpoints...]`)
    .argument('[endpoints...]', 'GraphQL endpoints or schema files.')
    .option(
      '-H, --header <header>',
      'Custom header for the introspection query.',
      (value, previous: string[]) => [...previous, value],
      []
    )
    .option('--react', 'Include React hooks in the generated client.')
    .option(
      '--subscriptions [client]',
      'Includes specified package as subscription client, must be graphql-ws compatible.'
    )
    .option('--no-subscriptions')
    .option('--target <path>', 'Destination path for the generated client.')
    .option(
      '--typescript',
      'Generates a TypeScript client over a JavaScript one.'
    )
    .option('--no-typescript')
    .option(
      '--install',
      'Automatically install dependencies with current package manager.'
    )
    .option('--no-install')
    .option(
      '-w, --watch',
      'Activate watch mode, regenerate on change changes.',
      false
    )
    .action(async (argv: string[], options: CommandOptions) => {
      const config: GQtyConfig = await cosmiconfig('gqty')
        .search()
        .then((result) => result?.config ?? {});

      let endpoints = argv;

      if (endpoints.length === 0) {
        if (!process.stdin.isTTY) {
          logger.error('Please provide your GraphQL endpoint(s).');
          process.exit(1);
        }

        endpoints = await promptEndpoints(
          config.introspections
            ? Object.keys(config.introspections).join(', ')
            : config.introspection?.endpoint
        );
      }

      endpoints = endpoints.map((endpoint) => endpoint.trim()).filter(Boolean);

      if (endpoints.length === 0) {
        return logger.error('Please provide your GraphQL endpoint(s).');
      }

      // Make sure we have a object for `fetchSchemas` to fill in user headers.
      if (!config.introspections) {
        config.introspections = {};
      }

      const schema = await fetchSchemas(endpoints, {
        headers:
          convertHeadersInput(options.header) ?? config.introspection?.headers,
        headersByEndpoint: config.introspections,
      });

      if (Object.keys(config.introspections ?? {}).length > 0) {
        // TODO: Save config to file.
      }

      const manifest = await (async () => {
        try {
          return JSON.parse(
            await readFile('package.json', { encoding: 'utf-8' })
          ) as PackageJSON;
        } catch {
          return;
        }
      })();

      // Detect React and TypeScript from package.json.
      if (manifest) {
        config.react ??= manifest.dependencies?.['react'] !== undefined;

        config.javascriptOutput ??=
          manifest.dependencies?.['typescript'] === undefined &&
          manifest.devDependencies?.['typescript'] === undefined;
      }

      // Detect Subscriptions from schema.
      if (schema.getSubscriptionType()) {
        config.subscriptions ??= 'graphql-ws';
      }

      // CLI options
      {
        if (options.react) {
          config.react = true;
        }

        // Explicitly allow empty string
        if (options.subscriptions !== undefined) {
          config.subscriptions = options.subscriptions || false;
        }

        if (options.typescript) {
          config.javascriptOutput = false;
        }

        if (options.target) {
          config.destination = options.target;
        }
      }

      // Enter interactive mode if user did not provide arguments.
      if (argv.length === 0) {
        config.react = await promptReact(config.react ?? false);

        config.subscriptions = await promptSubscriptions(
          config.subscriptions
            ? config.subscriptions === true
              ? 'graphql-ws'
              : config.subscriptions
            : undefined
        );

        config.javascriptOutput = !(await promptTypescript(
          !config.javascriptOutput
        ));

        config.destination ??= await promptTarget(
          config.javascriptOutput ? 'gqty/index.js' : 'gqty/index.ts'
        );
      }

      config.destination ??= config.javascriptOutput
        ? 'gqty/index.js'
        : 'gqty/index.ts';

      if (isURL(argv[0])) {
        config.endpoint = argv[0];
      }

      await generateClient(schema, {
        destination: '',
        ...config,
      });

      if (argv.length === 0 && options.install === undefined) {
        await promptInstall(config);
      } else if (manifest && options.install !== false) {
        await runInstall(manifest, config);
      }

      // Watch mode
      if (options.watch) {
        const { printSchema } = await import('graphql');
        const { FasterSMA: SMA } = await import('trading-signals');
        const { default: throttle } = await import('lodash-es/throttle.js');
        const {
          default: { isMatch },
        } = await import('micromatch');

        const sma = new SMA(3);
        const getMovingAverage = () => {
          try {
            return sma.getResult();
          } catch {
            if (sma.prices.length === 0) return 0;

            return sma.prices.reduce((a, b) => a + b, 0) / sma.prices.length;
          }
        };
        const doGenerateSchema = throttle(
          async () => {
            if (mutexLock) return;

            mutexLock = true;

            const start = Date.now();

            try {
              const schema = await fetchSchemas(endpoints, {
                headers: convertHeadersInput(options.header),
                headersByEndpoint: config.introspections,
                silent: true,
              });

              const schemaText = printSchema(schema);

              if (schemaText === lastSchema) return;

              lastSchema = schemaText;

              await generateClient(schema, {
                destination: '',
                ...config,
              });

              sma.update(Date.now() - start);
            } finally {
              mutexLock = false;
            }
          },
          1000,
          { leading: true, trailing: true }
        );

        let mutexLock = false;
        let lastSchema: string = printSchema(schema);

        logger.info('[GQty] Watching for schema changes... (Ctrl+C to exit)');

        // Polling loop, only happens with URL endpoints.
        if (endpoints.some((endpoint) => isURL(endpoint))) {
          (async () => {
            while (true) {
              const wait = Math.max(
                5000,
                Math.min(30000, getMovingAverage() * 10)
              );

              await new Promise((resolve) => setTimeout(resolve, wait));

              doGenerateSchema();
            }
          })();
        }

        // Watch file changes
        (async () => {
          for await (const { filename } of watch('.', { recursive: true })) {
            if (isMatch(filename, endpoints)) {
              doGenerateSchema();
            }
          }
        })();
      }

      // TODO: Change all `import type` from generated.ts to `import { type ... }`
    });
};

const promptEndpoints = async (defaultEndpoint?: string) => {
  const { endpoints } = await inquirer.prompt<{ endpoints: string }>({
    name: 'endpoints',
    type: 'input',
    message: 'Where is your GraphQL endpoint or schema files?',
    default: defaultEndpoint,
  });

  return endpoints
    .split(/[,\s+]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const promptTarget = async (defaultTarget: string) => {
  const { target } = await inquirer.prompt<{ target: string }>({
    name: 'target',
    type: 'input',
    message: 'Where should the client be generated?',
    default: defaultTarget,
  });

  return target;
};

const promptReact = async (defaultValue: boolean) => {
  const { react } = await inquirer.prompt<{ react: boolean }>({
    name: 'react',
    type: 'confirm',
    message: 'Are you using React with GQty?',
    default: defaultValue,
  });

  return react;
};

const promptSubscriptions = async (defaultValue?: string) => {
  const { subscriptions } = await inquirer.prompt<{ subscriptions: string }>({
    name: 'subscriptions',
    type: 'input',
    message: 'Do you need a subscription client? (Enter "-" to skip)',
    default: defaultValue?.trim() || undefined,
  });

  return subscriptions?.trim().replace(/^\-$/, '') || false;
};

const promptTypescript = async (defaultValue: boolean) => {
  const { typescript } = await inquirer.prompt<{ typescript: boolean }>({
    name: 'typescript',
    type: 'confirm',
    message: 'Do you want a TypeScript client over vanilla.js?',
    default: defaultValue,
  });

  return typescript;
};
