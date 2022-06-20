import { sha1 } from '@gqty/utils/sha1';

import { serializeVariables } from '../Utils/cachedJSON';
import {
  Selection,
  SelectionConstructorArgs,
  SelectionType,
} from './selection';

export function separateSelectionTypes(
  selections: Selection[] | Set<Selection>
) {
  let querySelections: Selection[] | undefined;
  let mutationSelections: Selection[] | undefined;
  let subscriptionSelections: Selection[] | undefined;

  for (const selection of selections) {
    switch (selection.type) {
      case SelectionType.Query: {
        querySelections ||= [];
        querySelections.push(selection);
        break;
      }
      case SelectionType.Mutation: {
        mutationSelections ||= [];
        mutationSelections.push(selection);
        break;
      }
      case SelectionType.Subscription: {
        subscriptionSelections ||= [];
        subscriptionSelections.push(selection);
        break;
      }
    }
  }

  return {
    querySelections,
    mutationSelections,
    subscriptionSelections,
  };
}

export interface GetSelection {
  ({
    key,
    prevSelection,
    args,
    argTypes,
    type,
    unions,
  }: Pick<
    SelectionConstructorArgs,
    'key' | 'prevSelection' | 'args' | 'argTypes' | 'type' | 'unions'
  >): Selection;
}

export interface SelectionManager {
  getSelection: GetSelection;
  restore(backup: unknown): void;
  backup(): SelectionsBackup;
}

export type VariableHashTuple = [
  serializedVariables: string,
  variablesStringId: string
];
const selectionsBackupVersion = 'v1';

function isSelectionsBackup(
  selectionsBackup?: unknown
): selectionsBackup is SelectionsBackup {
  return (
    Array.isArray(selectionsBackup) &&
    Array.isArray(selectionsBackup[0]) &&
    Array.isArray(selectionsBackup[1]) &&
    Array.isArray(selectionsBackup[2]) &&
    selectionsBackup[3] === selectionsBackupVersion
  );
}

export type SelectionsBackup = [VariableHashTuple[], string];

let uniqueSelectionId = 0;

export function createSelectionManager(): SelectionManager {
  const selectionCache = new Map<
    /**
     * cacheKey
     */
    string,
    Selection
  >();

  const stringsHash: Record<string, string> = {};

  let restoredBackup: SelectionsBackup | undefined;

  function getSerializedVariablesId(variables: Record<string, unknown>) {
    const serializedVariables = serializeVariables(variables);

    let hashId: string;

    if ((hashId = stringsHash[serializedVariables]) === undefined) {
      hashId = stringsHash[serializedVariables] = sha1(
        serializedVariables
      ).slice(0, 5);

      if (restoredBackup) restoredBackup[0].push([serializedVariables, hashId]);
    }

    return hashId;
  }

  function restore(backup: unknown) {
    if (!isSelectionsBackup(backup)) return;

    restoredBackup = backup;

    for (const [stringKey, hashIdValue] of backup[1]) {
      stringsHash[stringKey] = hashIdValue;
    }
  }

  function backup(): SelectionsBackup {
    if (restoredBackup) {
      restoredBackup[0] = [];

      return restoredBackup;
    }

    const backup: SelectionsBackup = [[], selectionsBackupVersion];

    for (const serializedVariables in stringsHash) {
      backup[0].push([serializedVariables, stringsHash[serializedVariables]]);
    }

    return (restoredBackup = backup);
  }

  function getVariableAlias(
    key: string | number,
    variables: Record<string, unknown>,
    variableTypes: Record<string, string>
  ) {
    return (
      key +
      '_' +
      getSerializedVariablesId(variableTypes) +
      '_' +
      getSerializedVariablesId(variables)
    );
  }

  function getSelection({
    key,
    prevSelection,
    args,
    argTypes,
    type,
    unions,
  }: Pick<
    SelectionConstructorArgs,
    'key' | 'prevSelection' | 'args' | 'argTypes' | 'type' | 'unions'
  >) {
    let alias: string | undefined;
    let cacheKey = key + '';
    if (args && argTypes) {
      alias = getVariableAlias(key, args, argTypes);
      cacheKey = alias;
    }

    if (prevSelection) {
      cacheKey = prevSelection.pathString + '.' + cacheKey;
    }

    if (unions?.length) {
      cacheKey += ';' + unions.join(';');
    }

    let selection = selectionCache.get(cacheKey);

    if (selection == null) {
      selection = new Selection({
        key,
        prevSelection,
        args,
        argTypes,
        alias,
        type,
        unions,
        id: ++uniqueSelectionId,
      });
      selectionCache.set(cacheKey, selection);
    } else if (args) {
      selection.args = args;
    }

    return selection;
  }

  return {
    getSelection,
    restore,
    backup,
  };
}
