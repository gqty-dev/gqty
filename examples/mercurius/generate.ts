import { writeGenerate } from '@gqty/cli';
import { app } from './src';

(async () => {
  await app.ready();

  const destinationPath = await writeGenerate(
    app.graphql.schema,
    './src/generated/gqty.ts',
    {
      scalarTypes: {
        ExampleScalar: 'string',
      },
    }
  );

  console.log(`gqty schema generated at ${destinationPath}`);
})();
