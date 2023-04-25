import {
  parse,
  stripIgnoredCharacters as officialStripIgnoredCharacters,
} from 'graphql';
import { buildQuery } from '../src/QueryBuilder';
import { Selection } from '../src/Selection';

describe('buildQuery()', () => {
  it('should builds basic query', () => {
    const baseSelection = Selection.createRoot('query');
    const selectionA = baseSelection.getChild('a');
    const selectionB = baseSelection.getChild('b');

    const [{ query, variables }] = buildQuery(
      new Set([selectionA, selectionB])
    );

    expect(query).toMatchInlineSnapshot(`"query{a b}"`);

    expect(variables).toBe(undefined);
    expect(() => parse(query)).not.toThrow();
    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should builds deep query with unions', () => {
    const baseSelection = Selection.createRoot('query');
    const selectionD = baseSelection
      .getChild('a')
      .getChild('b')
      .getChild('c')
      .getChild('d');

    const selectionD1 = selectionD.getChild('val1', { isUnion: true });
    const selectionD1B = selectionD1.getChild('b');
    const selectionD1A = selectionD1.getChild('a');
    const selectionD1AF = selectionD1A.getChild('f');

    const selectionD2 = selectionD.getChild('val2', { isUnion: true });
    const selectionD2A = selectionD2.getChild('a');
    const selectionD2AF = selectionD2A.getChild('f');

    const [{ query, variables }] = buildQuery(
      new Set([selectionD1B, selectionD1AF, selectionD2AF])
    );

    expect(query).toMatchInlineSnapshot(
      `"query{a{b{c{d{...on val1{a{f}b}...on val2{a{f}}}}}}}"`
    );

    expect(variables).toBe(undefined);
    expect(() => parse(query)).not.toThrow();
    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should queries with arguments', () => {
    const baseSelection = Selection.createRoot('query');
    const selectionA = baseSelection.getChild('a', {
      alias: 'gqtyAlias_1',
      parent: baseSelection,
      input: {
        types: {
          a: 'Int!',
          b: 'String!',
        },
        values: {
          a: 1,
          b: 1,
        },
      },
    });
    const selectionB = selectionA.getChild('a_b');
    const selectionC = selectionA.getChild('a_c');
    const selectionD = baseSelection.getChild('d');

    const [{ query, variables }] = buildQuery(
      new Set([selectionB, selectionC, selectionD])
    );

    expect(query).toMatchInlineSnapshot(
      `"query($v1:Int!$v2:String!){d gqtyAlias_1:a(a:$v1 b:$v2){a_b a_c}}"`
    );
    expect(() => parse(query)).not.toThrow();
    expect(variables).toEqual({ v1: 1, v2: 1 });
    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should build mutation with arguments', () => {
    const baseSelection = Selection.createRoot('mutation');
    const selectionA = baseSelection.getChild('a', {
      alias: 'gqtyAlias_1',
      parent: baseSelection,
      input: {
        values: {
          a: 1,
          b: 1,
        },
        types: {
          a: 'Int!',
          b: 'String!',
        },
      },
    });

    const [{ query, variables }] = buildQuery(new Set([selectionA]));

    expect(query).toMatchInlineSnapshot(
      `"mutation($v1:Int!$v2:String!){gqtyAlias_1:a(a:$v1 b:$v2)}"`
    );

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(variables).toEqual({ v1: 1, v2: 1 });

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should query with operation name', () => {
    const baseSelection = Selection.createRoot('query');
    const selectionA = baseSelection.getChild('a');

    const [{ query }] = buildQuery(new Set([selectionA]), 'TestQuery');

    expect(query).toMatchInlineSnapshot(`"query TestQuery{a}"`);
    expect(() => parse(query)).not.toThrow();
    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });
});
