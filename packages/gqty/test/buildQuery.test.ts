import {
  parse,
  stripIgnoredCharacters as officialStripIgnoredCharacters,
} from 'graphql';

import { createQueryBuilder } from '../src/QueryBuilder';
import { Selection, SelectionType } from '../src/Selection';

const buildQuery = createQueryBuilder();

describe('buildQuery()', () => {
  it('should builds basic query', () => {
    const baseSelection = new Selection({
      key: 'query',
      type: SelectionType.Query,
      id: 0,
    });

    const selectionA = new Selection({
      key: 'a',
      prevSelection: baseSelection,
      id: 1,
    });

    const selectionB = new Selection({
      key: 'b',
      prevSelection: baseSelection,
      id: 2,
    });

    const { query, variables } = buildQuery([selectionA, selectionB], {
      type: 'query',
    });

    expect(query).toMatchInlineSnapshot(`"query{a b}"`);

    expect(variables).toBe(undefined);

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should builds deep query with unions', () => {
    const baseSelection = new Selection({
      key: 'query',
      type: SelectionType.Query,
      id: 0,
    });

    const selectionA = new Selection({
      key: 'a',
      prevSelection: baseSelection,
      id: 1,
    });

    const selectionB = new Selection({
      key: 'b',
      prevSelection: selectionA,
      id: 2,
    });

    const selectionC = new Selection({
      key: 'c',
      prevSelection: selectionB,
      id: 3,
    });

    const selectionD = new Selection({
      key: 'd',
      prevSelection: selectionC,
      id: 4,
    });

    const selectionE1 = new Selection({
      key: 'a',
      prevSelection: selectionD,
      unions: ['val1', 'val2'],
      id: 4,
    });

    const selectionE2 = new Selection({
      key: 'b',
      prevSelection: selectionD,
      unions: ['val1'],
      id: 5,
    });

    const selectionF = new Selection({
      key: 'f',
      prevSelection: selectionE1,
      id: 6,
    });

    const { query, variables } = buildQuery([selectionE2, selectionF], {
      type: 'query',
    });

    expect(query).toMatchInlineSnapshot(
      `"query{a{b{c{d{...on val1{b a{f}}...on val2{a{f}}}}}}}"`
    );

    expect(variables).toBe(undefined);

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should queries with arguments', () => {
    const baseSelection = new Selection({
      key: 'query',
      type: SelectionType.Query,
      id: 0,
    });

    const selectionA = new Selection({
      key: 'a',
      prevSelection: baseSelection,
      args: {
        a: 1,
        b: 1,
      },
      argTypes: {
        a: 'Int!',
        b: 'String!',
      },
      alias: 'gqtyAlias_1',
      id: 1,
    });

    const selectionB = new Selection({
      key: 'a_b',
      prevSelection: selectionA,
      id: 2,
    });

    const selectionC = new Selection({
      key: 'a_c',
      prevSelection: selectionA,
      id: 3,
    });

    const selectionD = new Selection({
      key: 'd',
      prevSelection: baseSelection,
      id: 4,
    });

    const { query, variables } = buildQuery(
      [selectionB, selectionC, selectionD],
      {
        type: 'query',
      }
    );

    expect(query).toMatchInlineSnapshot(
      `"query($a1:Int!$b2:String!){gqtyAlias_1:a(a:$a1 b:$b2){a_b a_c}d}"`
    );

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(variables).toEqual({ a1: 1, b2: 1 });

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should build mutation with arguments', () => {
    const baseSelection = new Selection({
      key: 'mutation',
      type: SelectionType.Mutation,
      id: 1,
    });

    const selectionA = new Selection({
      key: 'a',
      prevSelection: baseSelection,
      args: {
        a: 1,
        b: 1,
      },
      argTypes: {
        a: 'Int!',
        b: 'String!',
      },
      alias: 'gqtyAlias_1',
      id: 2,
    });

    const { query, variables } = buildQuery([selectionA], {
      type: 'mutation',
    });

    expect(query).toMatchInlineSnapshot(
      `"mutation($a1:Int!$b2:String!){gqtyAlias_1:a(a:$a1 b:$b2)}"`
    );

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(variables).toEqual({ a1: 1, b2: 1 });

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });

  it('should fails on mismatched selection type', () => {
    const baseSelection = new Selection({
      key: 'mutation',
      type: SelectionType.Query,
      id: 0,
    });

    expect(() => {
      buildQuery([baseSelection], { type: 'query' });
    }).toThrow('Expected root selection of type "query", found "mutation".');
  });

  it('should query with operation name', () => {
    const baseSelection = new Selection({
      key: 'query',
      type: SelectionType.Query,
      id: 0,
    });

    const selectionA = new Selection({
      key: 'a',
      prevSelection: baseSelection,
      id: 1,
      operationName: 'TestQuery',
    });

    const { query } = buildQuery([selectionA], {
      type: 'query',
    });

    expect(query).toMatchInlineSnapshot(`"query TestQuery{a}"`);

    expect(() => {
      parse(query);
    }).not.toThrow();

    expect(officialStripIgnoredCharacters(query)).toBe(query);
  });
});
