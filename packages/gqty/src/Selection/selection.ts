export enum SelectionType {
  Query,
  Mutation,
  Subscription,
}

export type SelectionConstructorArgs = {
  id: number;
  key: string | number;
  prevSelection?: Selection;
  type?: SelectionType;
  alias?: string;
  args?: Record<string, unknown>;
  argTypes?: Record<string, string>;
  unions?: string[];
};

export class Selection {
  id: string;

  key: string | number;

  type: SelectionType;

  unions?: string[];

  args?: Readonly<Record<string, unknown>>;
  argTypes?: Readonly<Record<string, string>>;
  alias?: string;

  cachePath: readonly (string | number)[] = [];
  pathString: string;

  selectionsList: readonly Selection[];

  noIndexSelections: readonly Selection[];

  prevSelection: Selection | null = null;

  currentCofetchSelections: Set<Selection> | null = null;

  constructor({
    key,
    prevSelection,
    args,
    argTypes,
    type,
    alias,
    unions,
    id,
  }: SelectionConstructorArgs) {
    this.id = id + '';
    this.key = key;

    const pathKey = alias || key;

    const isInterfaceUnionSelection = key === '$on';

    this.cachePath = isInterfaceUnionSelection
      ? prevSelection?.cachePath || []
      : prevSelection
      ? [...prevSelection.cachePath, pathKey]
      : [pathKey];

    this.pathString = isInterfaceUnionSelection
      ? prevSelection?.pathString || ''
      : prevSelection
      ? prevSelection.pathString + '.' + pathKey
      : pathKey.toString();

    const prevSelectionsList = prevSelection?.selectionsList || [];

    this.selectionsList = [...prevSelectionsList, this];

    const prevNoSelectionsList = prevSelection?.noIndexSelections || [];

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

    this.type = type || prevSelection?.type || SelectionType.Query;

    if (prevSelection) this.prevSelection = prevSelection;
  }

  addCofetchSelections(selections: Selection[] | Set<Selection>) {
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
