import { writeGenerate } from '@gqty/cli';
import { ezApp } from './src';

(async () => {
  const getEnveloped = await ezApp.buildApp().getEnveloped;
  const destinationPath = await writeGenerate(
    getEnveloped().schema,
    './src/generated/gqty.ts',
    {
      scalarTypes: {
        ExampleScalar: 'string',
      },
    }
  );

  console.log(`gqty schema generated at ${destinationPath}`);
})();
