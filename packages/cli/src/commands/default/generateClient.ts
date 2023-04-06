import { type GraphQLSchema } from 'graphql';
import { unlink } from 'node:fs/promises';
import { SetRequired, type GQtyConfig } from '../../config';
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

      if (existingFile.includes('export const {')) {
        logger.warn(
          `To prevent possible bundling issues, it's recommended to change the export syntax from "export const { query, ... } = client;" to "const { query, ... } = client; export { query, ... };"`
        );
      }
    }
  );

  logger.successProgress(`Code generation completed.`);
  console.log('');
};

const promptRegenerate = async (message: string): Promise<boolean> => {
  const { regenerate } = await inquirer.prompt<{ regenerate: boolean }>({
    type: 'confirm',
    name: 'regenerate',
    message,
    default: false,
  });

  return regenerate;
};
