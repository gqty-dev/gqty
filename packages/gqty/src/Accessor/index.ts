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

        const __typename = target[key]?.__typename;
        if (!__typename || !context.schema[key]) return;

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
            data: target[key],
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

/* TODO: Selection - null
 *
 * Cache accessor and selections such that subsequent selections are
 * retained when null types are returned from the cache, where new selections
 * are prevented from happening.
 *
 * Make sure such cache is cleared when new selections can be made again.
 *
 * Triggering onSelect() for all scalar selections inside would suffice, no
 * need to cache the whole selection tree.
 *
 * Cache by value, nullObjectKey? Every single fetch should cache selections
 * from last time, cached selections are only used as long as we got nulls.
 *
 * Caching accessors may prevent accessors from showing new values, so we only
 * cache selections by null values and empty arrays.
 */

/* TODO: Selection - Conditional Rendering
 *
 * Handles conditional rendering that triggers query update on itself
 * which results in infinite circular renderings.
 *
 * When a cache is still fresh, subsequent fetches should merge with objects
 * instead of replacing them. Except on refetches, i.e. no-cache and no-store,
 * which should instead invalidate reachable cache roots during selection.
 */

/* TODO: Selection - use()
 *
 * Replace `assignSelection` with `Selection.use(Selection)`,
 * `Selection.getLeafNodes()` should comes in handy.
 */
