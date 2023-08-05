import type { DebugEvent, GQtyClient } from 'gqty';
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

  const stringifyJSONIfEnabled = async <T extends object>(v: T) => {
    if (options.stringifyJSON && v) {
      return parseJSON(v);
    }
    return v;
  };

  let idMapper = 0;
  const QueryIdMapper: Record<string, number> = {};

  async function onFetch({
    cache,
    label,
    request: { query, variables, operationName, extensions },
    result,
    result: { error } = {},
    selections,
  }: DebugEvent) {
    const startTime = Date.now();
    const fetchTime = startTime - startTime; // [ ] Implement an actual timer
    const queryId = (QueryIdMapper[query] ||= ++idMapper);

    console.groupCollapsed(
      ...format(
        ['GraphQL ', 'color: gray'],
        [
          extensions?.type + (operationName ? ` (${operationName})` : ' '),
          `color: ${error ? 'red' : '#03A9F4'}; font-weight: bold`,
        ],
        ['ID ' + queryId + ' ', 'color: green'],
        ...(label ? [[label + ' ', 'color: green']] : []),
        [`(${fetchTime}ms)`, 'color: gray'],
        [
          ` ${
            new Set([...selections].map((s) => s.root.getLeafNodes())).size
          } selections`,
          'color: gray',
        ],

        error && [
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
          await stringifyJSONIfEnabled(variables)
        );
      }

      console.log(...format([await parseGraphQL(query)]));

      console.groupEnd();
    }

    if (error) {
      console.error(...format(['Error', headerStyles]), serializeError(error));
    } else if (result) {
      console.log(
        ...format(['Result', headerStyles]),
        await stringifyJSONIfEnabled(result)
      );
    }

    if (options.showSelections) {
      console.groupCollapsed(...format(['Selections', headerStyles]));
      for (const { key, cacheKeys, alias, input, isUnion } of selections) {
        console.log(
          await stringifyJSONIfEnabled({
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
        await stringifyJSONIfEnabled(cache?.toJSON())
      );
    }

    console.groupEnd();
  }

  /**
   * Start logging, it returns the "stop" function
   */
  function start() {
    const unsubscribe = client.subscribeDebugEvents(onFetch);

    return unsubscribe;
  }

  return {
    start,
    options,
  };
}
