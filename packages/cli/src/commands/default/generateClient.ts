import type { GraphQLSchema } from 'graphql';
import { unlink } from 'node:fs/promises';
import type { GQtyConfig, SetRequired } from '../../config';
import { inquirer } from '../../deps';
import { writeGenerate } from '../../writeGenerate';
import { logger } from './logger';

export const generateClient = async (
  schema: GraphQLSchema,
  configuration: SetRequired<GQtyConfig, 'destination'>
) => {
  logger.infoProgress(`Generating client and schema ...`);

  await writeGenerate(
    schema,
    configuration.destination,
    configuration,
    async (existingFile) => {
      process.stdout.write('\r');

      if (
        configuration.subscriptions &&
        !existingFile.includes('createSubscriptionsClient') &&
        (await promptRegenerate(
          `Subscrioption client not found in ${configuration.destination}, do you want to regenerate it?`
        ))
      ) {
        await unlink(configuration.destination);
        await writeGenerate(schema, configuration.destination, configuration);
        return;
      }

      if (
        configuration.react &&
        !existingFile.includes('createReactClient') &&
        (await promptRegenerate(
          `React hooks not found in ${configuration.destination}, do you want to regenerate it?`
        ))
      ) {
        await unlink(configuration.destination);
        await writeGenerate(schema, configuration.destination, configuration);
        return;
      }
    }
  );

  logger.successProgress(`Code generation completed.`);
  console.log();
};

const promptRegenerate = async (message: string): Promise<boolean> => {
  const regenerate = await inquirer.confirm({
    message,
    default: false,
  });

  return regenerate;
};
