import { type Schema } from 'gqty';

/**
 * Builds and returns TypeScript code for `MutationParamNames` and `QueryParamNames` objects,
 * each containing the argument names for every field that actually has arguments.
 *
 * @param generatedSchema - GQty's generated schema object (`query`, `mutation`, etc.)
 * @returns A string of TypeScript code with the two objects declared.
 */
export function generateMutationQueryParamNames(
  generatedSchema: Schema
): string {
  let code = '';

  // Handle "mutation" and "query"
  (['mutation', 'query'] as const).forEach((opName) => {
    const opFields = generatedSchema[opName];
    if (!opFields) return;

    // Collect property lines, e.g. "userCreate: ['values', 'organizationId'...]"
    const lines: string[] = [];

    for (const fieldName of Object.keys(opFields)) {
      if (fieldName === '__typename') continue;

      const field = opFields[fieldName];
      if (!field.__args) continue;

      const argNamesInOrder = Object.keys(field.__args);

      if (argNamesInOrder.length) {
        const arr = argNamesInOrder.map((arg) => `"${arg}"`).join(', ');
        lines.push(`  ${fieldName}: [${arr}]`);
      }
    }

    if (!lines.length) return;

    // E.g. "export const MutationParamNames = { userCreate: [...], ... };"
    const capitalized = opName.charAt(0).toUpperCase() + opName.slice(1);
    code += `export const ${capitalized}ParamNames = {\n${lines.join(',\n')}\n};\n`;
  });

  return code;
}
