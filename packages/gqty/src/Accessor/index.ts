import type { ProxyAccessor } from '../Cache';
import type { InnerClientState } from '../Client/client';
import { GQtyError } from '../Error';
import {
  DeepPartial,
  parseSchemaType,
  Schema,
  SchemaUnionsKey,
  Type,
} from '../Schema';
import { Selection, SelectionType } from '../Selection';
import {
  decycle,
  isInteger,
  isObject,
  retrocycle,
  isObjectWithType,
} from '../Utils';

const ProxySymbol = Symbol('gqty-proxy');

export class SchemaUnion {
  constructor(
    /** union name */
    public name: string,
    public types: Record<
      /** object type name */
      string,
      /** schema type of object type */
      Record<string, Type>
    >,
    /**
     * Proxy target, pre-made for performance
     */
    public fieldsProxy: Record<string, typeof ProxySymbol>
  ) {}
}

export type SchemaUnions = {
  unions: Record<string, SchemaUnion>;
  unionObjectTypesForSelections: Record<string, [string]>;
};

export function createSchemaUnions(schema: Readonly<Schema>): SchemaUnions {
  const unionObjectTypesForSelections: Record<string, [string]> = {};

  const unions = Object.entries(
    schema[SchemaUnionsKey] /* istanbul ignore next */ || {}
  ).reduce<SchemaUnions['unions']>((acum, [name, unionTypes]) => {
    const types = unionTypes.reduce((typeAcum, objectTypeName) => {
      unionObjectTypesForSelections[objectTypeName] ||= [objectTypeName];
      const objectType = schema[objectTypeName];
      /* istanbul ignore else */
      if (objectType) {
        typeAcum[objectTypeName] = objectType;
      }
      return typeAcum;
    }, {} as SchemaUnion['types']);

    acum[name] = new SchemaUnion(
      name,
      types,
      unionTypes.reduce<SchemaUnion['fieldsProxy']>((fieldsAcum, fieldName) => {
        fieldsAcum[fieldName] = ProxySymbol;
        return fieldsAcum;
      }, {})
    );

    return acum;
  }, {});

  return {
    unions,
    unionObjectTypesForSelections,
  };
}

export interface SetCache {
  (selection: Selection, data: unknown): void;
  <A extends object>(
    accessor: A,
    data: DeepPartial<A> | null | undefined
  ): void;
  <B extends (args?: any) => unknown>(
    accessor: B,
    args: Parameters<B>['0'],
    data: DeepPartial<ReturnType<B>> | null | undefined
  ): void;
}

export interface AssignSelections {
  <A extends object, B extends A>(
    source: A | null | undefined,
    target: B | null | undefined
  ): void;
}

export interface AccessorCreators<
  GeneratedSchema extends {
    query: {};
    mutation: {};
    subscription: {};
  }
> {
  createAccessor: (
    schemaValue: Schema[string] | SchemaUnion,
    prevSelection: Selection,
    unions?: string[] | undefined,
    parentTypename?: string | undefined
  ) => ProxyAccessor | null;
  createArrayAccessor: (
    schemaValue: Schema[string] | SchemaUnion,
    prevSelection: Selection,
    unions?: string[] | undefined,
    parentTypename?: string | undefined
  ) => ProxyAccessor | null;
  assignSelections: AssignSelections;
  setCache: SetCache;
  query: GeneratedSchema['query'];
  mutation: GeneratedSchema['mutation'];
  subscription: GeneratedSchema['subscription'];
}

export function createAccessorCreators<
  GeneratedSchema extends {
    query: {};
    mutation: {};
    subscription: {};
  } = never
>(innerState: InnerClientState): AccessorCreators<GeneratedSchema> {
  const {
    accessorCache,
    selectionManager,
    interceptorManager,
    scalarsEnumsHash,
    schema,
    eventHandler,
    schemaUnions: { unions: schemaUnions, unionObjectTypesForSelections },
    clientCache: schedulerClientCache,
    scheduler: {
      errors: { map: schedulerErrorsMap },
    },
    normalizationHandler,
  } = innerState;

  const ResolveInfoSymbol = Symbol();

  interface ResolveInfo {
    key: string | number;
    prevSelection: Selection;
    argTypes: Record<string, string> | undefined;
  }

  const proxySymbolArray = [ProxySymbol];

  function extractDataFromProxy(value: unknown): unknown {
    if (accessorCache.isProxy(value)) {
      const accessorSelection = accessorCache.getProxySelection(value);

      // An edge case hard to reproduce
      /* istanbul ignore if */
      if (!accessorSelection) return;

      const selectionCache =
        innerState.clientCache.getCacheFromSelection(accessorSelection);

      if (selectionCache === undefined) return;

      return selectionCache;
    } else if (isObject(value)) {
      /**
       * This is necessary to be able to extract data from proxies
       * inside user-made objects and arrays
       */
      return retrocycle<object>(JSON.parse(JSON.stringify(value)));
    }
    return value;
  }

  function setCache(selection: Selection, data: unknown): void;
  function setCache<A extends object>(
    accessor: A,
    data: DeepPartial<A> | null | undefined
  ): void;
  function setCache<B extends (args?: any) => unknown>(
    accessor: B,
    args: Parameters<B>['0'],
    data: DeepPartial<ReturnType<B>> | null | undefined
  ): void;
  function setCache(
    accessorOrSelection: unknown,
    dataOrArgs: unknown,
    possibleData?: unknown
  ) {
    if (accessorOrSelection instanceof Selection) {
      const data = extractDataFromProxy(dataOrArgs);
      innerState.clientCache.setCacheFromSelection(accessorOrSelection, data);
      eventHandler.sendCacheChange({
        data,
        selection: accessorOrSelection,
      });
    } else if (typeof accessorOrSelection === 'function') {
      if (dataOrArgs !== undefined && typeof dataOrArgs !== 'object') {
        throw new GQtyError('Invalid arguments of type: ' + typeof dataOrArgs, {
          caller: setCache,
        });
      }

      const resolveInfo = (
        accessorOrSelection as Function & {
          [ResolveInfoSymbol]?: ResolveInfo;
        }
      )[ResolveInfoSymbol];

      if (!resolveInfo) {
        throw new GQtyError('Invalid gqty function', {
          caller: setCache,
        });
      }

      const selection = innerState.selectionManager.getSelection({
        ...resolveInfo,
        args: dataOrArgs as Record<string, unknown>,
      });

      const data = extractDataFromProxy(possibleData);

      innerState.clientCache.setCacheFromSelection(selection, data);
      eventHandler.sendCacheChange({
        data,
        selection,
      });
    } else if (accessorCache.isProxy(accessorOrSelection)) {
      const selection = accessorCache.getProxySelection(accessorOrSelection);

      // An edge case hard to reproduce
      /* istanbul ignore if */
      if (!selection) {
        throw new GQtyError('Invalid proxy selection', {
          caller: setCache,
        });
      }

      const data = extractDataFromProxy(dataOrArgs);

      innerState.clientCache.setCacheFromSelection(selection, data);
      eventHandler.sendCacheChange({
        data,
        selection,
      });
    } else {
      throw new GQtyError('Invalid gqty proxy', {
        caller: setCache,
      });
    }
  }

  function createArrayAccessor(
    schemaValue: Schema[string] | SchemaUnion,
    prevSelection: Selection,
    unions?: string[],
    parentTypename?: string
  ) {
    const arrayCacheValue = innerState.clientCache.getCacheFromSelection<
      undefined | null | unknown[]
    >(prevSelection);
    if (innerState.allowCache && arrayCacheValue === null) return null;

    const proxyValue: unknown[] =
      arrayCacheValue === undefined ||
      !Array.isArray(arrayCacheValue) ||
      (!innerState.allowCache &&
        Array.isArray(arrayCacheValue) &&
        arrayCacheValue.length === 0)
        ? proxySymbolArray
        : arrayCacheValue;

    const accessor = accessorCache.getArrayAccessor(
      prevSelection,
      proxyValue,
      () => {
        return new Proxy(proxyValue, {
          set(_target, key: string, value: unknown) {
            let index: number | undefined;

            try {
              index = parseInt(key);
            } catch (err) {}

            if (isInteger(index)) {
              const selection = innerState.selectionManager.getSelection({
                key: index,
                prevSelection,
              });

              const data = extractDataFromProxy(value);

              innerState.clientCache.setCacheFromSelection(selection, data);

              eventHandler.sendCacheChange({
                selection,
                data,
              });

              return true;
            }

            if (key === 'length') {
              if (!Array.isArray(arrayCacheValue)) {
                console.warn(
                  'Invalid array assignation to unresolved proxy array'
                );
                return true;
              }

              Reflect.set(arrayCacheValue, key, value);

              eventHandler.sendCacheChange({
                selection: prevSelection,
                data: innerState.clientCache.getCacheFromSelection(
                  prevSelection
                ),
              });
              return true;
            }

            throw TypeError('Invalid array assignation: ' + key);
          },
          get(target, key: string, receiver) {
            if (key === 'length') {
              if (proxyValue === proxySymbolArray) {
                const lengthSelection =
                  innerState.selectionManager.getSelection({
                    key: 0,
                    prevSelection,
                  });
                const childAccessor = createAccessor(
                  schemaValue,
                  lengthSelection,
                  unions,
                  parentTypename
                );

                accessorCache.addAccessorChild(accessor, childAccessor);

                if (childAccessor) Reflect.get(childAccessor, '__typename');
              }

              return target.length;
            } else if (key === 'toJSON') {
              return () =>
                decycle<unknown[]>(
                  innerState.clientCache.getCacheFromSelection(
                    prevSelection,
                    []
                  )
                );
            }

            let index: number | undefined;

            try {
              index = parseInt(key);
            } catch (err) {}

            if (isInteger(index)) {
              const selection = innerState.selectionManager.getSelection({
                key: index,
                prevSelection,
              });

              // For the subscribers of data changes
              interceptorManager.addSelectionCache(selection);

              if (
                innerState.allowCache &&
                arrayCacheValue !== undefined &&
                arrayCacheValue?.[index] == null
              ) {
                /**
                 * If cache is enabled and arrayCacheValue[index] is 'null' or 'undefined', return it
                 */
                return arrayCacheValue?.[index];
              }

              const childAccessor = createAccessor(
                schemaValue,
                selection,
                unions,
                parentTypename
              );

              accessorCache.addAccessorChild(accessor, childAccessor);

              return childAccessor;
            }

            return Reflect.get(target, key, receiver);
          },
        });
      }
    );

    return accessor;
  }

  const notFoundObjectKey = {};
  const nullObjectKey = {};

  const unionsCacheValueMap = new WeakMap<string[], WeakMap<object, object>>();

  function getCacheValueReference(
    cacheValue: unknown,
    unions: string[] | undefined
  ) {
    if (unions === undefined) return cacheValue;

    const mapKey: object =
      cacheValue == null
        ? nullObjectKey
        : typeof cacheValue === 'object'
        ? cacheValue!
        : notFoundObjectKey;

    let cacheValueMap = unionsCacheValueMap.get(unions);

    if (!cacheValueMap) {
      cacheValueMap = new WeakMap();
      cacheValueMap.set(unions, mapKey);
    }

    let cacheReference = cacheValueMap.get(mapKey);

    if (!cacheReference) {
      cacheReference = {};
      cacheValueMap.set(mapKey, cacheReference);
    }

    return cacheReference;
  }

  function getCacheTypename(selection: Selection): string | void {
    const cacheValue: unknown =
      innerState.clientCache.getCacheFromSelection(selection);

    if (isObjectWithType(cacheValue)) return cacheValue.__typename;

    interceptorManager.addSelection(
      innerState.selectionManager.getSelection({
        key: '__typename',
        prevSelection: selection,
      })
    );
  }

  const emptyScalarArray = Object.freeze([]);

  const querySelection = selectionManager.getSelection({
    key: 'query',
    type: SelectionType.Query,
  });

  const mutationSelection = selectionManager.getSelection({
    key: 'mutation',
    type: SelectionType.Mutation,
  });

  const subscriptionSelection = selectionManager.getSelection({
    key: 'subscription',
    type: SelectionType.Subscription,
  });

  function createAccessor(
    schemaValue: Schema[string] | SchemaUnion,
    prevSelection: Selection,
    unions?: string[],
    parentTypename?: string
  ) {
    let cacheValue: unknown =
      innerState.clientCache.getCacheFromSelection(prevSelection);
    if (innerState.allowCache && cacheValue === null) return null;

    const accessor = accessorCache.getAccessor(
      prevSelection,
      getCacheValueReference(cacheValue, unions),
      () => {
        const isUnionsInterfaceSelection = Boolean(unions && parentTypename);

        if (normalizationHandler && (parentTypename || unions)) {
          if (unions) {
            const schemaKeys = normalizationHandler.schemaKeys;

            for (const objectTypeName of unions) {
              const objectNormalizationKeys = schemaKeys[objectTypeName];
              if (objectNormalizationKeys?.length) {
                const coFetchSelections = objectNormalizationKeys.map((key) =>
                  innerState.selectionManager.getSelection({
                    key,
                    prevSelection,
                    unions: unionObjectTypesForSelections[objectTypeName] || [
                      objectTypeName,
                    ],
                  })
                );

                prevSelection.addCofetchSelections(coFetchSelections);
              }
            }
          } else if (parentTypename) {
            const normalizationKeys =
              normalizationHandler.schemaKeys[parentTypename];
            if (normalizationKeys?.length) {
              const selections = normalizationKeys.map((key) =>
                innerState.selectionManager.getSelection({
                  key,
                  prevSelection,
                })
              );

              prevSelection.addCofetchSelections(selections);
            }
          }
        }

        const autoFetchUnionTypename = isUnionsInterfaceSelection
          ? () => {
              if (isUnionsInterfaceSelection) {
                interceptorManager.addSelection(
                  innerState.selectionManager.getSelection({
                    key: '__typename',
                    prevSelection,
                  })
                );
              }
            }
          : undefined;

        const proxyValue =
          schemaValue instanceof SchemaUnion
            ? schemaValue.fieldsProxy
            : Object.keys(schemaValue).reduce((acum, key) => {
                acum[key] = ProxySymbol;
                return acum;
              }, {} as Record<string, unknown>);

        return new Proxy(proxyValue, {
          set(_target, key: string, value: unknown) {
            if (!proxyValue.hasOwnProperty(key))
              throw TypeError('Invalid proxy assignation');

            const targetSelection = innerState.selectionManager.getSelection({
              key,
              prevSelection,
              unions,
            });

            const data = extractDataFromProxy(value);

            innerState.clientCache.setCacheFromSelection(targetSelection, data);
            eventHandler.sendCacheChange({
              data,
              selection: targetSelection,
            });

            return true;
          },
          get(_target, key: string, _receiver) {
            if (key === 'toJSON')
              return () =>
                decycle<{}>(
                  innerState.clientCache.getCacheFromSelection(
                    prevSelection,
                    {}
                  )
                );

            if (schemaValue instanceof SchemaUnion) {
              if (!(key in schemaValue.types)) return;

              if (innerState.allowCache) {
                const typename = getCacheTypename(prevSelection);

                if (typename && typename !== key) return;
              }

              return createAccessor(
                schemaValue.types[key],
                prevSelection,
                [key],
                key
              );
            }

            if (!proxyValue.hasOwnProperty(key)) return;

            const { __type, __args } = schemaValue[key];
            let { pureType, isArray } = parseSchemaType(__type);

            const resolve = (args?: {
              argValues: Record<string, unknown>;
              argTypes: Record<string, string>;
            }): unknown => {
              const selection = innerState.selectionManager.getSelection({
                key,
                prevSelection,
                args: args != null ? args.argValues : undefined,
                argTypes: args != null ? args.argTypes : undefined,
                unions,
              });

              // For the subscribers of data changes
              interceptorManager.addSelectionCache(selection);

              if (scalarsEnumsHash[pureType]) {
                const cacheValue =
                  innerState.clientCache.getCacheFromSelection(selection);

                accessorCache.addSelectionToAccessorHistory(
                  accessor,
                  selection
                );

                if (cacheValue === undefined) {
                  innerState.foundValidCache = false;

                  let unionTypename: string | undefined | void;
                  const isUnionWithDifferentTypeResult =
                    isUnionsInterfaceSelection
                      ? !!(unionTypename = getCacheTypename(prevSelection)) &&
                        unionTypename !== parentTypename
                      : false;

                  /**
                   * If cache was not found & the selection doesn't have errors,
                   * add the selection to the queue, except when querying unions or interfaces
                   * and the __typename doesn't correspond to the target object type
                   */
                  if (
                    // SelectionType.Subscription === 2
                    selection.type === 2 ||
                    (!isUnionWithDifferentTypeResult &&
                      (schedulerClientCache !== innerState.clientCache ||
                        !schedulerErrorsMap.has(selection)))
                  ) {
                    interceptorManager.addSelection(selection);
                    autoFetchUnionTypename?.();
                  }

                  return isArray ? emptyScalarArray : undefined;
                } else if (
                  !innerState.allowCache ||
                  // SelectionType.Subscription === 2
                  selection.type === 2
                ) {
                  // Or if you are making the network fetch always
                  interceptorManager.addSelection(selection);
                  autoFetchUnionTypename?.();
                } else {
                  // Support cache-and-network / stale-while-revalidate pattern
                  interceptorManager.addSelectionCacheRefetch(selection);
                }

                return cacheValue;
              }

              let typeValue: Record<string, Type> | SchemaUnion =
                schema[pureType];

              if (!typeValue && pureType.startsWith('$')) {
                typeValue = schemaUnions[(pureType = pureType.slice(1))];
              }

              if (typeValue) {
                const childAccessor = (
                  isArray ? createArrayAccessor : createAccessor
                )(typeValue, selection, undefined, pureType);

                accessorCache.addAccessorChild(accessor, childAccessor);

                return childAccessor;
              }

              throw new GQtyError(
                `GraphQL Type not found: ${pureType}, available fields: "${Object.keys(
                  schemaValue
                ).join(' | ')}"`
              );
            };

            if (__args) {
              const resolveInfo: ResolveInfo = {
                key,
                prevSelection,
                argTypes: __args,
              };

              return Object.assign(
                function ProxyFn(
                  argValues: Record<string, unknown> = emptyVariablesObject
                ) {
                  return resolve({
                    argValues,
                    argTypes: __args,
                  });
                },
                {
                  [ResolveInfoSymbol]: resolveInfo,
                }
              );
            }

            return resolve();
          },
        });
      }
    );
    return accessor;
  }

  const query: GeneratedSchema['query'] = createAccessor(
    schema.query,
    querySelection
  )!;
  const mutation: GeneratedSchema['mutation'] = createAccessor(
    schema.mutation,
    mutationSelection
  )!;
  const subscription: GeneratedSchema['subscription'] = createAccessor(
    schema.subscription,
    subscriptionSelection
  )!;

  function assignSelections<A extends object, B extends A>(
    source: A | null | undefined,
    target: B | null | undefined
  ): void {
    if (source == null || target == null) return;

    let sourceSelection: Selection;
    let targetSelection: Selection;

    if (
      !accessorCache.isProxy(source) ||
      !(sourceSelection = accessorCache.getProxySelection(source)!)
    )
      throw new GQtyError('Invalid source proxy', {
        caller: assignSelections,
      });
    if (
      !accessorCache.isProxy(target) ||
      !(targetSelection = accessorCache.getProxySelection(target)!)
    )
      throw new GQtyError('Invalid target proxy', {
        caller: assignSelections,
      });

    const sourceSelections = accessorCache.getSelectionSetHistory(source);

    if (!sourceSelections) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Source proxy doesn't have any selections made");
      }
      return;
    }

    for (const selection of sourceSelections) {
      let mappedSelection = targetSelection;
      const filteredSelections = selection.selectionsList.filter(
        (value) => !sourceSelection.selectionsList.includes(value)
      );

      for (const { key, args, argTypes } of filteredSelections) {
        mappedSelection = innerState.selectionManager.getSelection({
          key,
          args,
          argTypes,
          prevSelection: mappedSelection,
        });
      }

      accessorCache.addSelectionToAccessorHistory(target, mappedSelection);
      interceptorManager.addSelection(mappedSelection);
    }
  }

  return {
    createAccessor,
    createArrayAccessor,
    assignSelections,
    setCache,
    query,
    mutation,
    subscription,
  };
}

const emptyVariablesObject = {};
