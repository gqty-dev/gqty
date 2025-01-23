import { type Schema } from 'gqty';

/**
 * Generates TypeScript code that defines:
 * 1) convertParamsToArgsFn<T>(argNames: string[], params: unknown[]): T
 *    - Creates a normal object (not null-prototype)
 *    - Omits undefined values
 *
 * 2) convertParamsToArgs = {
 *      Mutation: { ... },
 *      Query: { ... }
 *    }
 *    - Each method calls convertParamsToArgsFn with the appropriate
 *      ParamNames and typed parameters.
 *
 * @param generatedSchema - The GQty generated schema (with query/mutation definitions).
 * @returns A string of TypeScript code to be appended to the final schema file.
 */
export function generateConvertParamsToArgs(generatedSchema: Schema): string {
  // Start with the function definition
  let code = `
export function convertParamsToArgsFn<T>(argNames: string[], params: unknown[]): T {
  const result: Record<string, unknown> = {};

  argNames.forEach((key, index) => {
    const value = params[index];
    // Only set the property if it's not undefined
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result as T;
}
`;

  // Build the convertParamsToArgs object
  let mutationMethods = '';
  if (generatedSchema.mutation) {
    for (const fieldName of Object.keys(generatedSchema.mutation)) {
      if (fieldName === '__typename') continue;
      const fieldValue = generatedSchema.mutation[fieldName];
      // Only generate a method if the field has arguments
      if (!fieldValue.__args || !Object.keys(fieldValue.__args).length)
        continue;

      mutationMethods += `
    ${fieldName}(params: MutationTypes["${fieldName}"]["params"]): Parameters<Mutation["${fieldName}"]>[0] {
      return convertParamsToArgsFn<Parameters<Mutation["${fieldName}"]>[0]>(
        MutationParamNames["${fieldName}"],
        params
      );
    },`;
    }
  }

  let queryMethods = '';
  if (generatedSchema.query) {
    for (const fieldName of Object.keys(generatedSchema.query)) {
      if (fieldName === '__typename') continue;
      const fieldValue = generatedSchema.query[fieldName];
      if (!fieldValue.__args || !Object.keys(fieldValue.__args).length)
        continue;

      queryMethods += `
    ${fieldName}(params: QueryTypes["${fieldName}"]["params"]): Parameters<Query["${fieldName}"]>[0] {
      return convertParamsToArgsFn<Parameters<Query["${fieldName}"]>[0]>(
        QueryParamNames["${fieldName}"],
        params
      );
    },`;
    }
  }

  code += `
export const convertParamsToArgs = {
  Mutation: {${mutationMethods}
  },
  Query: {${queryMethods}
  }
};
`;

  return code;
}
