import type { Selection } from '../Selection';
import { set } from '../Utils';
import { serializeVariables } from '../Utils/cachedJSON';

interface SelectionTree {
  [P: string]: SelectionTree | true;
}

const stringSelectionTree = (v: SelectionTree) => {
  const treeEntries = Object.entries(v);
  return treeEntries.reduce((acum, [key, value], index) => {
    if (typeof value === 'object') {
      acum += key + '{';

      acum += stringSelectionTree(value);

      acum += '}';
    } else {
      acum += key + (index !== treeEntries.length - 1 ? ' ' : '');
    }
    return acum;
  }, '');
};

interface BuiltQuery {
  query: string;
  variables: Record<string, unknown> | undefined;
  cacheKey: string;
}

export function createQueryBuilder() {
  const queryCache: Record<string, BuiltQuery | undefined> = {};

  return function buildQuery(
    selections: Set<Selection> | Selection[],
    {
      type,
    }: {
      type: 'query' | 'mutation' | 'subscription';
    },
    normalization?: boolean,
    isGlobalCache?: boolean
  ): BuiltQuery {
    let variableId = 1;

    const selectionTree: SelectionTree = {};
    const variablesMap = new Map<string, string>();
    const variableTypes: Record<string, string> = {};
    const variablesMapKeyValue: Record<string, unknown> = {};
    const [{ operationName }] = selections;

    if (normalization) {
      const selectionsSet = new Set<Selection>();

      for (const selection of selections) {
        if (selection.cofetchSelections) {
          for (const coFetchSelection of selection.cofetchSelections) {
            selectionsSet.add(coFetchSelection);
          }
        }

        selectionsSet.add(selection);
      }
      selections = selectionsSet;
    }

    let builtQuery: BuiltQuery | undefined;
    let idAcum = operationName ?? '';

    if (isGlobalCache) {
      for (const { id } of selections) idAcum += id;

      if ((builtQuery = queryCache[idAcum])) return builtQuery;
    }

    for (const { noIndexSelections } of selections) {
      if (noIndexSelections[0]?.key !== type) {
        throw new Error(
          `Expected root selection of type "${type}", found "${noIndexSelections[0].key}".`
        );
      }

      const selectionBranches: string[][] = [];

      function createSelectionBranch(
        selections: readonly Selection[],
        initialValue: string[] = []
      ) {
        return selections.reduce(
          (acum, { args, alias, key, argTypes, unions }, index) => {
            if (key === '$on') return acum;

            const argsLength = args ? Object.keys(args).length : 0;

            const selectionKey = alias ? alias + ':' + key : key;

            let leafValue: string;

            if (args && argTypes && argsLength) {
              leafValue =
                selectionKey +
                '(' +
                Object.entries(args).reduce((acum, [key, value], index) => {
                  const variableMapKey =
                    argTypes[key] + '-' + key + '-' + JSON.stringify(value);

                  variablesMapKeyValue[variableMapKey] = value;

                  const variableMapValue = variablesMap.get(variableMapKey);

                  if (variableMapValue) {
                    acum += key + ':$' + variableMapValue;
                  } else {
                    const newVariableValue = key + variableId++;
                    const newVariableType = argTypes[key];

                    variableTypes[newVariableValue] = newVariableType;
                    variablesMap.set(variableMapKey, newVariableValue);

                    acum += key + ':$' + newVariableValue;
                  }

                  if (index < argsLength - 1) {
                    acum += ' ';
                  }

                  return acum;
                }, '') +
                ')';
            } else {
              leafValue = selectionKey + '';
            }

            if (unions) {
              for (const union of unions.slice(1)) {
                const newAcum = [...acum, '...on ' + union, leafValue];

                selectionBranches.push(
                  createSelectionBranch(selections.slice(index + 1), newAcum)
                );
              }

              acum.push('...on ' + unions[0], leafValue);
            } else {
              acum.push(leafValue);
            }

            return acum;
          },
          initialValue
        );
      }

      selectionBranches.push(createSelectionBranch(noIndexSelections));

      for (const branch of selectionBranches) {
        if (normalization) {
          for (let i = 2; i < branch.length; ++i) {
            const typenameBranch = branch.slice(0, i);
            if (typenameBranch[typenameBranch.length - 1]?.startsWith('...')) {
              continue;
            } else typenameBranch.push('__typename');

            set(selectionTree, typenameBranch, true);
          }
        }

        set(selectionTree, branch, true);
      }
    }

    let variables: Record<string, unknown> | undefined;

    if (variablesMap.size) {
      const variablesObj: Record<string, unknown> = {};
      variables = variablesObj;

      variablesMap.forEach((value, key) => {
        variablesObj[value] = variablesMapKeyValue[key];
      });
    }

    let query = stringSelectionTree(selectionTree);

    const variableTypesEntries = Object.entries(variableTypes);

    if (variableTypesEntries.length) {
      query = query.replace(
        type,
        type +
          '(' +
          variableTypesEntries.reduce((acum, [variableName, type]) => {
            acum += '$' + variableName + ':' + type;
            return acum;
          }, '') +
          ')'
      );
    }

    if (operationName) {
      query = query.replace(type, type + ' ' + operationName);
    }

    builtQuery = {
      query,
      variables,
      cacheKey:
        idAcum || query + (variables ? serializeVariables(variables) : ''),
    };

    if (isGlobalCache) queryCache[idAcum] = builtQuery;

    return builtQuery;
  };
}
