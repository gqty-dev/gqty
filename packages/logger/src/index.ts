import type { DebugEvent, GQtyClient, Selection } from 'gqty';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierEstree from 'prettier/plugins/estree';
import * as prettierGraphQL from 'prettier/plugins/graphql';
import { format as prettierFormat } from 'prettier/standalone';
import { serializeError } from './serializeError';

async function parseGraphQL(query: string) {
  return await prettierFormat(query, {
    parser: 'graphql',
    plugins: [prettierBabel, prettierGraphQL],
  });
}

async function parseJSON(value: unknown) {
  return await prettierFormat(JSON.stringify(value), {
    parser: 'json',
    plugins: [prettierBabel, prettierEstree],
  });
}

function isTruthy<V>(v: V): v is NonNullable<V> {
  return Boolean(v);
}

const format = (...parts: Array<any[] | undefined>) => {
  const texts: string[] = [];
  const styles: string[] = [];
  for (const [text, style] of parts.filter(isTruthy)) {
    texts.push(text);
    styles.push(`font-weight: normal; ${style}`);
  }

  return [`%c${texts.join('%c')}`, ...styles];
};

export interface LoggerOptions {
  /**
   * Show selections in logs
   *
   * @default
   * true
   */
  showSelections?: boolean;
  /**
   * Show cache snapshots in logs
   *
   * @default
   * true
   */
  showCache?: boolean;
  /**
   * Stringify JSON
   *
   * @default
   * false
   */
  stringifyJSON?: boolean;
}

export function createLogger(
  client: GQtyClient<any>,
  options: LoggerOptions = {}
) {
  options = Object.assign({}, options);

  options.showCache ??= true;
  options.showSelections ??= true;
  options.stringifyJSON ??= false;

  const stringifyJSONIfEnabled = <T extends object>(v: T) => {
    if (options.stringifyJSON && v) {
      return parseJSON(v);
    }
    return v;
  };

  const queryIdMap = new Map<string, number>();
  const pendingQueries = new Set<Promise<unknown>>();

  async function onFetch({
    cache,
    label,
    request: { query, variables, operationName, extensions },
    promise,
    selections,
  }: DebugEvent) {
    if (!promise) return;

    pendingQueries.add(promise);

    if (!queryIdMap.has(query)) {
      queryIdMap.set(query, queryIdMap.size);
    }

    const startTime = Date.now();
    const result = await promise;
    const fetchTime = Date.now() - startTime;

    pendingQueries.delete(promise);

    const uniqueSelections = [...selections].reduce(
      (map, s) => map.set(s.cacheKeys.join('.'), s),
      new Map<string, Selection>()
    );

    console.groupCollapsed(
      ...format(
        ['GraphQL ', 'color: gray'],
        [
          extensions?.type + (operationName ? ` (${operationName})` : ' '),
          `color: ${result?.error ? 'red' : '#03A9F4'}; font-weight: bold`,
        ],
        [`ID ${queryIdMap.get(query)} `, 'color: green'],
        ...(label ? [[label + ' ', 'color: green']] : []),
        [`(${fetchTime}ms)`, 'color: gray'],
        [` ${uniqueSelections.size} selections`, 'color: gray'],

        result?.error && [
          'FAILED',
          'margin-left: 10px; border-radius: 2px; padding: 2px 6px; background: #e84343; color: white',
        ]
      )
    );

    const headerStyles = `font-weight: bold; color: #f316c1`;

    // Ignore empty string queries
    if (query) {
      console.group(
        ...format(
          ['Query ', headerStyles],
          ['  ', `background-image: url(https://graphql.org/img/logo.svg)`]
        )
      );

      if (variables) {
        console.log(
          ...format(['Variables', 'color: #25e1e1']),
          stringifyJSONIfEnabled(variables)
        );
      }

      console.log(...format([await parseGraphQL(query)]));

      console.groupEnd();
    }

    if (result?.error) {
      console.error(
        ...format(['Error', headerStyles]),
        serializeError(result.error)
      );
    } else if (result) {
      console.log(
        ...format(['Result', headerStyles]),
        stringifyJSONIfEnabled(result)
      );
    }

    if (options.showSelections) {
      console.groupCollapsed(...format(['Selections', headerStyles]));
      for (const [
        ,
        { key, cacheKeys, alias, input, isUnion },
      ] of uniqueSelections) {
        console.log(
          stringifyJSONIfEnabled({
            key,
            cacheKeys: cacheKeys.join('.'),
            alias,
            input,
            isUnion,
          })
        );
      }
      console.groupEnd();
    }

    if (options.showCache) {
      console.log(
        ...format(['Cache snapshot', headerStyles]),
        stringifyJSONIfEnabled(cache?.toJSON())
      );
    }

    console.groupEnd();
  }

  return {
    /** Start logging and returns the "stop" function. */
    start: () => client.subscribeDebugEvents(onFetch),
    options,
  };
}
