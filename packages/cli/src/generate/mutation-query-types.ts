import { parseSchemaType, type Schema, type ScalarsEnumsHash } from 'gqty';

/**
 * Generates code for two interfaces: `MutationTypes` and `QueryTypes`.
 *
 * Each interface entry looks like:
 *   fieldName: {
 *     params: [arg1?: ..., arg2: ...],
 *     return: SomeReturnType
 *   };
 *
 * For each argument and return type, we rely on `parseSchemaType(...)`
 * to detect arrays, nullability, etc., then convert them to TypeScript
 * (e.g. `Array<Maybe<ScalarsEnums["String"]>>`).
 */
export function generateMutationQueryTypes(
  generatedSchema: Schema,
  scalarsEnumsHash: ScalarsEnumsHash
): string {
  let code = '';

  // If there's a "mutation" object, build "MutationTypes"
  if (generatedSchema.mutation) {
    code += makeOperationInterface(
      'mutation',
      'MutationTypes',
      generatedSchema,
      scalarsEnumsHash
    );
  }

  // If there's a "query" object, build "QueryTypes"
  if (generatedSchema.query) {
    code += makeOperationInterface(
      'query',
      'QueryTypes',
      generatedSchema,
      scalarsEnumsHash
    );
  }

  return code;
}

/**
 * Builds an interface for either "mutation" or "query".
 * E.g. "export interface MutationTypes { userCreate: {...}; }".
 */
function makeOperationInterface(
  opKey: 'mutation' | 'query',
  interfaceName: string,
  generatedSchema: Schema,
  scalarsEnumsHash: ScalarsEnumsHash
) {
  const operationFields = generatedSchema[opKey];
  if (!operationFields) return '';

  const fieldNames = Object.keys(operationFields).filter(
    (name) => name !== '__typename'
  );
  if (!fieldNames.length) return '';

  // Accumulate lines for each field that has arguments
  const lines: string[] = [];

  for (const fieldName of fieldNames) {
    const fieldValue = operationFields[fieldName];
    if (!fieldValue.__args || !Object.keys(fieldValue.__args).length) {
      // Skip fields with no arguments
      continue;
    }

    // Build a 'params: [ ... ]' tuple using parseSchemaType for each arg
    const argEntries = Object.entries(fieldValue.__args);
    const argLines = argEntries.map(([argName, argTypeString]) => {
      const parsed = parseSchemaType(argTypeString);
      const tsType = buildTsTypeFromParsed(parsed, scalarsEnumsHash);
      // If it's required => "argName: tsType", else => "argName?: tsType"
      const isRequired = !parsed.isNullable && !parsed.hasDefaultValue;
      return isRequired ? `${argName}: ${tsType}` : `${argName}?: ${tsType}`;
    });

    // Build the return type
    const returnParsed = parseSchemaType(fieldValue.__type);
    const returnTsType = buildTsTypeFromParsed(returnParsed, scalarsEnumsHash);

    lines.push(`
  ${fieldName}: {
    params: [${argLines.join(', ')}];
    return: ${returnTsType};
  };`);
  }

  if (!lines.length) return '';

  return `
export interface ${interfaceName} {${lines.join('')}
}
`;
}

/**
 * Converts the parsed type info (via `parseSchemaType`) into a final TS type string.
 * e.g. "ScalarsEnums["String"]", "Array<Maybe<ScalarsEnums["Int"]>>", "MyObject", ...
 */
function buildTsTypeFromParsed(
  parsed: ReturnType<typeof parseSchemaType>,
  scalarsEnumsHash: ScalarsEnumsHash
): string {
  const { pureType, isArray, nullableItems, isNullable, hasDefaultValue } =
    parsed;

  // If recognized as a scalar or enum => "ScalarsEnums["pureType"]", else use pureType
  let baseType = scalarsEnumsHash[pureType]
    ? `ScalarsEnums["${pureType}"]`
    : pureType;

  // If it's an array, wrap in Array<...>, possibly with Maybe<...> for items
  if (isArray) {
    if (nullableItems) {
      baseType = `Array<Maybe<${baseType}>>`;
    } else {
      baseType = `Array<${baseType}>`;
    }
  }

  // If the field is nullable or has a default, wrap the entire thing in Maybe<...>
  // (This matches GQty's typical approach.)
  if (isNullable || hasDefaultValue) {
    baseType = `Maybe<${baseType}>`;
  }

  return baseType;
}
