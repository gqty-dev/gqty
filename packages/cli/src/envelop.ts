import { LazyPromise } from 'gqty/Utils/promise';
import type { GraphQLSchema } from 'graphql';
import type { GenerateOptions, TransformSchemaOptions } from './generate';
import type { OnExistingFileConflict } from './writeGenerate';

export interface UseGenerateGQtyOptions extends GenerateOptions {
  /**
   * Client generation destination
   */
  destination?: string;
  /**
   * Customize the behavior when the target client file already exists, by default it does nothing
   */
  onExistingFileConflict?: OnExistingFileConflict;
  /**
   * Custom Schema generation transformations
   */
  transformsGenerate?: TransformSchemaOptions;
  /**
   * What to do when an error happens
   *
   * @default console.error
   */
  onError?: (err: unknown) => void;
}

export function useGenerateGQty(config?: UseGenerateGQtyOptions): {
  onSchemaChange(options: { schema: GraphQLSchema }): void;
} {
  const pluginDeps = LazyPromise(async () => {
    const [{ writeGenerate }, { config: gqtyConfig }, { defaultConfig }] =
      await Promise.all([
        import('./writeGenerate'),
        import('./config').then((v) => v.gqtyConfigPromise),
        import('./config'),
      ]);

    return {
      writeGenerate,
      gqtyConfig,
      defaultConfig,
    };
  });

  return {
    onSchemaChange({ schema }) {
      pluginDeps
        .then(({ gqtyConfig, writeGenerate, defaultConfig }) => {
          const {
            destination = gqtyConfig.destination ?? defaultConfig.destination,
            onExistingFileConflict,
            transformsGenerate,
            onError = console.error,
            ...generateOptions
          } = config || {};

          writeGenerate(
            schema,
            destination,
            { ...gqtyConfig, ...generateOptions },
            onExistingFileConflict,
            transformsGenerate
          ).catch(onError);
        })
        .catch(config?.onError || console.error);
    },
  };
}
