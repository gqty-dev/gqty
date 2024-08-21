import type { PackageJSON } from 'bob-esbuild/config/packageJson';
import type { Command } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import assert from 'node:assert';
import { readFile, watch } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { GQtyConfig } from '../config';
import { fg, inquirer } from '../deps';
import { convertHeadersInput } from './default/convertHeadersInput';
import { fetchSchema, isURL } from './default/fetchSchema';
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
    .option('--no-react')
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

      const schema = await fetchSchema(endpoints, {
        headers:
          convertHeadersInput(options.header) ?? config.introspection?.headers,
        headersByEndpoint: config.introspections,
      }).catch(terminateWithError);

      if (Object.keys(config.introspections ?? {}).length > 0) {
        // [ ] Save config to file.
      }

      // CLI options
      {
        config.react ??= options.react;

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

      if (isURL(endpoints[0])) {
        config.endpoint = endpoints[0];
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
        const {
          default: { isMatch },
        } = await import('micromatch');
        const { default: throttle } = await import('lodash-es/throttle.js');
        const { FasterSMA: SMA } = await import(
          'trading-signals/dist/SMA/SMA.js'
        );
        const { printSchema } = await import('graphql');

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
              const schema = await fetchSchema(endpoints, {
                headers: convertHeadersInput(options.header),
                headersByEndpoint: config.introspections,
                silent: true,
              }).catch((e) => {
                if (e instanceof Error) {
                  logger.errorProgress(e.message);

                  return Promise.resolve(undefined);
                } else {
                  return Promise.reject(e);
                }
              });

              if (!schema) return;

              const schemaText = printSchema(schema);

              if (schemaText !== lastSchema) {
                lastSchema = schemaText;

                await generateClient(schema, {
                  destination: '',
                  ...config,
                });

                sma.update(Date.now() - start);
              }

              logger.infoProgress(
                'Watching for schema changes... (Ctrl+C to exit)'
              );
            } finally {
              mutexLock = false;
            }
          },
          1000,
          { leading: true, trailing: true }
        );

        let mutexLock = false;
        let lastSchema = printSchema(schema);

        logger.infoProgress('Watching for schema changes... (Ctrl+C to exit)');

        // Polling loop, only happens with URL endpoints.
        if (endpoints.some((endpoint) => isURL(endpoint))) {
          (async () => {
            // eslint-disable-next-line no-constant-condition
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
          // micromatch does not understand relative patterns, normalize them
          // ahead of time.
          const matchPatterns = endpoints.map((endpoint) =>
            path.resolve(endpoint)
          );

          // Find common path prefix
          const watchTarget = await fg(matchPatterns, { absolute: true }).then(
            (files) =>
              files
                .map((file) => path.dirname(file).split(path.sep))
                .reduce((prev, file) => {
                  let lastIndex = 0;

                  while (
                    lastIndex < prev.length &&
                    prev[lastIndex] === file[lastIndex]
                  ) {
                    lastIndex++;
                  }

                  return prev.slice(0, lastIndex);
                })
                // Intentionally combining roots and unresolveable parents here,
                // because roots are probably too noisy.
                .join(path.sep) || undefined
          );

          assert(watchTarget, `No common path for specified endpoints.`);

          let queued = false;

          for await (const { filename } of watch(watchTarget, {
            recursive: true,
          })) {
            if (!filename) continue;

            const absolutePath = path.resolve(watchTarget, filename);
            if (!isMatch(absolutePath, matchPatterns)) continue;
            if (mutexLock || queued) continue;

            queued = true;

            setTimeout(() => {
              doGenerateSchema().finally(() => {
                queued = false;
              });
            });
          }
        })();
      }
    });
};

const promptEndpoints = async (defaultEndpoint?: string) => {
  const endpoints = await inquirer.input({
    message: 'Where is your GraphQL endpoint or schema files?',
    default: defaultEndpoint,
  });

  return endpoints
    .split(/[,\s+]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const promptTarget = async (defaultTarget: string) => {
  const target = await inquirer.input({
    message: 'Where should the client be generated?',
    default: defaultTarget,
  });

  return target;
};

const promptReact = async (defaultValue: boolean) => {
  const react = await inquirer.confirm({
    message: 'Are you using React with GQty?',
    default: defaultValue,
  });

  return react;
};

const promptSubscriptions = async (defaultValue?: string) => {
  const subscriptions = await inquirer.input({
    message: 'Do you need a subscription client? (Enter "-" to skip)',
    default: defaultValue?.trim() || undefined,
  });

  return subscriptions?.trim().replace(/^-$/, '') || false;
};

const promptTypescript = async (defaultValue: boolean) => {
  const typescript = await inquirer.confirm({
    message: 'Do you want a TypeScript client over vanilla.js?',
    default: defaultValue,
  });

  return typescript;
};

const terminateWithError = (e: unknown) => {
  if (e instanceof Error) {
    logger.error(e.message);
    process.exit(1);
  }

  throw e;
};
