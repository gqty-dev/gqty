import { buildQuery } from '../src/QueryBuilder';
import { Selection } from '../src/Selection';

describe('selection creation', () => {
  it('should make selection branches', () => {
    const mutationRoot = Selection.createRoot('mutation');
    const selectionA = mutationRoot.getChild('a');

    expect(selectionA.key).toBe('a');
    expect(selectionA.alias).toBe(undefined);
    expect(selectionA.root.key).toBe('mutation');

    expect(selectionA.input).toBe(undefined);
    expect(selectionA.ancestry).toEqual([mutationRoot, selectionA]);

    expect(selectionA.cacheKeys).toEqual(['mutation', 'a']);

    const selectionB = selectionA.getChild('b');

    expect(selectionB.key).toBe('b');
    expect(selectionB.root.key).toBe('mutation');

    expect(selectionB.ancestry).toEqual([mutationRoot, selectionA, selectionB]);
    expect(selectionB.cacheKeys).toEqual(['mutation', 'a', 'b']);

    const selectionC = selectionB.getChild(0);

    expect(selectionC.cacheKeys).toEqual(selectionB.cacheKeys);

    const selectionD = selectionC.getChild('d', {
      input: {
        a: { type: 'Int!', value: 1 },
      },
    });

    expect(selectionD.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'd',
    ]);

    const repeatSelectionD = selectionC.getChild('d', {
      input: {
        a: { type: 'Int!', value: 1 },
      },
    });

    expect(repeatSelectionD.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'd',
    ]);

    const selectionE = selectionD.getChild('e');

    expect(selectionE.ancestry.map((s) => s.alias ?? s.key)).toEqual([
      'mutation',
      'a',
      'b',
      0,
      'd',
      'e',
    ]);

    const selectionF = Selection.createRoot('f');

    const selectionG = Selection.createRoot('subscription').getChild('g');

    expect(selectionF.cacheKeys).toEqual(['f']);

    expect(
      buildQuery(
        new Set([
          selectionA,
          selectionB,
          selectionC,
          selectionD,
          selectionE,
          selectionD,
          repeatSelectionD,
          selectionF,
          selectionG,
        ])
      ).length
    ).toEqual(3);
  });
});
