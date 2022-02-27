import { parseSchemaType, ParseSchemaTypeInfo } from '../src/Schema';

describe('parseSchemaType', () => {
  test('nullable type', () => {
    const info = parseSchemaType('String');

    expect(info).toEqual<ParseSchemaTypeInfo>({
      pureType: 'String',
      isNullable: true,
      hasDefaultValue: false,
      nullableItems: true,
      isArray: false,
    });
  });

  test('non-nullable type', () => {
    const info = parseSchemaType('String!');

    expect(info).toEqual<ParseSchemaTypeInfo>({
      pureType: 'String',
      isNullable: false,
      hasDefaultValue: false,
      nullableItems: true,
      isArray: false,
    });
  });
  test('nullable array with nullable items', () => {
    const info = parseSchemaType('[String]');

    expect(info).toEqual<ParseSchemaTypeInfo>({
      pureType: 'String',
      isNullable: true,
      hasDefaultValue: false,
      nullableItems: true,
      isArray: true,
    });
  });

  test('nullable array with non-nullable items', () => {
    const info = parseSchemaType('[String!]');

    expect(info).toEqual<ParseSchemaTypeInfo>({
      pureType: 'String',
      isNullable: true,
      hasDefaultValue: false,
      nullableItems: false,
      isArray: true,
    });
  });
});
