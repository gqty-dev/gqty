import type { BaseGeneratedSchema, SchemaContext } from '../Client';
import { GQtyError } from '../Error';
import type { GeneratedSchemaObject } from '../Schema';
import { Selection } from '../Selection';
import { $meta } from './meta';
import { createObjectAccessor } from './resolve';

export { $meta } from './meta';

export function createSchemaAccessor<TSchema extends BaseGeneratedSchema>(
  context: SchemaContext
): TSchema {
  const selectionCache = new Map<string, Selection>();

  return new Proxy(
    {
      query: { __typename: 'Query' },
      mutation: { __typename: 'Mutation' },
      subscription: { __typename: 'Subscription' },
    } as unknown as TSchema,
    {
      get(target, key: string) {
        if (key === 'toJSON') {
          return () => context.cache.toJSON();
        }

        if (!Reflect.has(target, key)) return;

        const schemaKey = key as keyof TSchema;

        if (
          !Reflect.get(target[schemaKey] as object, '__typename') ||
          !context.schema[key]
        )
          return;

        // Reuse root selections and their internally cached children, accessors
        // can in turn be safely cached by selections but still scoped.
        //
        // TODO: This is a half-way done solution for nullable objects, which
        // returns early and removes the possibility to make child selections.
        const selection = selectionCache.get(key) ?? Selection.createRoot(key);
        selectionCache.set(key, selection);

        return createObjectAccessor({
          context,
          cache: {
            data: target[key as keyof BaseGeneratedSchema],
            expiresAt: Infinity,
          },
          selection,
          type: { __type: key },
        });
      },
    }
  );
}

/**
 * Handler for object level data updates.
 */
export const setCache = <TData extends GeneratedSchemaObject>(
  accessor: TData,
  data: Partial<TData>
) => {
  const meta = $meta(accessor);
  if (!meta) {
    throw new GQtyError(`Subject must be an accessor.`);
  }

  data = ($meta(data)?.cache.data as TData | undefined) ?? data;
  if (!data || typeof data !== 'object') {
    throw new GQtyError(
      `Data must be a subset of the schema object, got type: ${typeof data}.`
    );
  }

  meta.cache.data = data;

  Object.assign(accessor, data);
};

/**
 * Use another accessor like a fragment, this function takes all children from
 * the donor and runs it again on the accessor.
 *
 * Useful when you want to query the eaxact same fields from a mutation.
 */
export const assignSelections = <TData extends GeneratedSchemaObject>(
  source: TData | null,
  target: TData | null
) => {
  if (source === null || target === null) return;

  if ($meta(source) === undefined) {
    throw new GQtyError(`Invalid source proxy`);
  }

  if ($meta(target) === undefined) {
    throw new GQtyError(`Invalid target proxy`);
  }

  const sourceSelection = $meta(source)?.selection;
  if (!sourceSelection) return;

  if (sourceSelection.children.size === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Source proxy doesn't have any selections made");
    }
  }

  const stack = new Set(sourceSelection.children.values());

  for (const it of stack) {
    if (it.children.size === 0) {
      // Replay the selection on the accessor
      let currentNode: TData | undefined;
      for (const selection of it.ancestry) {
        if (currentNode === undefined) {
          if (selection !== sourceSelection) continue;

          currentNode = target;
        } else {
          if (selection.input) {
            currentNode = currentNode[selection.key](selection.input);
          } else {
            currentNode = currentNode[selection.key];
          }
        }
      }
    } else {
      for (const [, child] of it.children) {
        stack.add(child);
      }
    }
  }
};

/* TODO: Selection - use()
 *
 * Replace `assignSelection` with `Selection.use(Selection)`,
 * `Selection.getLeafNodes()` should comes in handy.
 */
