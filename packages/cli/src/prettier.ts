import * as deps from './deps';

const { format: prettierFormat, resolveConfig } = deps.prettier;
const commonConfig = resolveConfig(process.cwd());

export function formatPrettier(
  defaultOptions: Omit<deps.PrettierOptions, 'parser'> &
    Required<Pick<deps.PrettierOptions, 'parser'>>
) {
  const configPromise = commonConfig.then((config) =>
    Object.assign({}, config, defaultOptions)
  );

  return {
    async format(input: string) {
      return prettierFormat(input, await configPromise);
    },
  };
}
