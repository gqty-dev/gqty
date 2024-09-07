import type { Selection } from '../../Selection';

export enum LegacySelectionType {
  Query,
  Mutation,
  Subscription,
}

export type LegacySelectionConstructorArgs = {
  id: number;
  key: string | number;
  prevSelection?: LegacySelection;
  type?: LegacySelectionType;
  operationName?: string;
  alias?: string;
  args?: Record<string, unknown>;
  argTypes?: Record<string, string>;
  unions?: string[];
};

export class LegacySelection {
  id: string;

  key: string | number;

  type: LegacySelectionType;

  operationName?: string;

  unions?: string[];

  args?: Readonly<Record<string, unknown>>;
  argTypes?: Readonly<Record<string, string>>;
  alias?: string;

  cachePath: readonly (string | number)[] = [];
  pathString: string;

  selectionsList: readonly LegacySelection[];

  noIndexSelections: readonly LegacySelection[];

  prevSelection: LegacySelection | null = null;

  currentCofetchSelections: Set<LegacySelection> | null = null;

  constructor({
    key,
    prevSelection,
    args,
    argTypes,
    type,
    operationName,
    alias,
    unions,
    id,
  }: LegacySelectionConstructorArgs) {
    this.id = id + '';
    this.key = key;
    this.operationName = operationName;
    this.prevSelection = prevSelection ?? null;

    const pathKey = alias || key;

    const isInterfaceUnionSelection = key === '$on';

    this.cachePath = isInterfaceUnionSelection
      ? (prevSelection?.cachePath ?? [])
      : prevSelection
        ? [...prevSelection.cachePath, pathKey]
        : [pathKey];

    this.pathString = isInterfaceUnionSelection
      ? (prevSelection?.pathString ?? '')
      : `${prevSelection?.pathString.concat('.') ?? ''}${pathKey}`;

    const prevSelectionsList = prevSelection?.selectionsList ?? [];

    this.selectionsList = [...prevSelectionsList, this];

    const prevNoSelectionsList = prevSelection?.noIndexSelections ?? [];

    this.noIndexSelections =
      typeof key === 'string'
        ? [...prevNoSelectionsList, this]
        : prevNoSelectionsList;

    // If both lists have the same length, we can assume they are the same and save some memory
    if (this.selectionsList.length === this.noIndexSelections.length) {
      this.noIndexSelections = this.selectionsList;
    }

    this.alias = alias;
    this.args = args;
    this.argTypes = argTypes;
    this.unions = unions;

    this.type = type ?? prevSelection?.type ?? LegacySelectionType.Query;
  }

  addCofetchSelections(selections: LegacySelection[] | Set<LegacySelection>) {
    const cofetchSet = (this.currentCofetchSelections ||= new Set());

    for (const selection of selections) {
      cofetchSet.add(selection);
    }
  }

  get cofetchSelections() {
    let currentPrevSelection = this.prevSelection;

    while (currentPrevSelection) {
      const currentPrevCofetchSelections =
        currentPrevSelection.currentCofetchSelections;

      if (currentPrevCofetchSelections) {
        this.addCofetchSelections(currentPrevCofetchSelections);
      }

      currentPrevSelection = currentPrevSelection.prevSelection;
    }

    return this.currentCofetchSelections;
  }
}

export const convertSelection = (
  selection: Selection,
  selectionId = 0,
  operationName?: string
): LegacySelection => {
  const args: Record<string, unknown> = {};
  const argTypes: Record<string, string> = {};

  if (selection.input) {
    for (const key in selection.input) {
      const { type, value } = selection.input[key];
      args[key] = value;
      argTypes[key] = type;
    }
  }

  return new LegacySelection({
    id: ++selectionId,
    key: selection.key,
    // translate the whole selection chain upwards
    prevSelection: selection.parent
      ? convertSelection(selection.parent, selectionId, operationName)
      : undefined,
    args,
    argTypes,
    type:
      selection.root.key === 'query'
        ? LegacySelectionType.Query
        : selection.root.key === 'mutation'
          ? LegacySelectionType.Mutation
          : LegacySelectionType.Subscription,
    operationName,
    alias: selection.alias,
    unions: selection.isUnion ? [selection.key.toString()] : undefined,
  });
};
