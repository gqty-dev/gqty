import { SelectionType } from '../src/Selection/selection';
import {
  createSelectionManager,
  separateSelectionTypes,
} from '../src/Selection/SelectionManager';

describe('selection creation', () => {
  const manager = createSelectionManager();

  test('selection with manager and separating types', () => {
    const selectionA = manager.getSelection({
      key: 'a',
      type: SelectionType.Mutation,
    });

    expect(selectionA.key).toBe('a'), expect(selectionA.alias).toBe(undefined);
    expect(selectionA.type).toBe(SelectionType.Mutation);

    expect(selectionA.args).toBe(undefined);
    expect(selectionA.argTypes).toBe(undefined);
    expect(selectionA.noIndexSelections).toEqual([selectionA]);

    expect(selectionA.cachePath).toEqual(['a']);
    expect(selectionA.pathString).toBe('a');

    const selectionB = manager.getSelection({
      key: 'b',
      prevSelection: selectionA,
    });

    expect(selectionB.key).toBe('b');
    expect(selectionB.type).toBe(SelectionType.Mutation);

    expect(selectionB.noIndexSelections).toEqual([selectionA, selectionB]);
    expect(selectionB.cachePath).toEqual(['a', 'b']);
    expect(selectionB.pathString).toBe('a.b');

    const selectionC = manager.getSelection({
      key: 0,
      prevSelection: selectionB,
    });

    expect(selectionC.noIndexSelections).toEqual(selectionB.noIndexSelections);

    const selectionD = manager.getSelection({
      key: 'd',
      prevSelection: selectionC,
      args: {
        a: 1,
      },
      argTypes: {
        a: 'Int!',
      },
    });

    expect(selectionD.cachePath).toEqual(['a', 'b', 0, 'd0']);
    expect(selectionD.pathString).toBe('a.b.0.d0');
    expect(selectionD.alias).toBe('d0');

    const repeatSelectionD = manager.getSelection({
      key: 'd',
      prevSelection: selectionC,
      args: {
        a: 1,
      },
      argTypes: {
        a: 'Int!',
      },
    });

    expect(repeatSelectionD.cachePath).toEqual(['a', 'b', 0, 'd0']);
    expect(repeatSelectionD.pathString).toBe('a.b.0.d0');
    expect(repeatSelectionD.alias).toBe('d0');

    const selectionE = manager.getSelection({
      key: 'e',
      prevSelection: selectionD,
    });

    expect(selectionE.cachePath).toEqual(['a', 'b', 0, 'd0', 'e']);
    expect(selectionE.pathString).toBe('a.b.0.d0.e');

    const selectionF = manager.getSelection({
      key: 'f',
    });

    const selectionG = manager.getSelection({
      key: 'g',
      type: SelectionType.Subscription,
    });

    expect(selectionF.cachePath).toEqual(['f']);
    expect(selectionF.pathString).toBe('f');

    expect(
      separateSelectionTypes([
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
    ).toEqual({
      querySelections: [selectionF],
      mutationSelections: [
        selectionA,
        selectionB,
        selectionC,
        selectionD,
        selectionE,
        selectionD,
        repeatSelectionD,
      ],
      subscriptionSelections: [selectionG],
    });
  });
});
