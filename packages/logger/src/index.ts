import { DebugEvent, GQtyClient, GQtyError } from 'gqty';
import parserJSON from 'prettier/parser-babel.js';
import parserGraphQL from 'prettier/parser-graphql.js';
import prettier from 'prettier/standalone.js';
import { serializeError } from './serializeError';

function parseGraphQL(query: string) {
  return prettier.format(query, {
    parser: 'graphql',
    plugins: [parserGraphQL],
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
      return prettier.format(JSON.stringify(v), {
        parser: 'json',
        plugins: [parserJSON],
      });
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
    result: { errors = [] } = {},
    selections,
  }: DebugEvent) {
    const startTime = Date.now();

    const error =
      errors.length > 1
        ? GQtyError.fromGraphQLErrors(errors)
        : errors.length === 1
        ? errors[0]
        : undefined;

    const queryId = (QueryIdMapper[query] ||= ++idMapper);

    const fetchTime = Date.now() - startTime;

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
        [` ${selections.size} selections`, 'color: gray'],

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
          stringifyJSONIfEnabled(variables)
        );
      }

      console.log(...format([parseGraphQL(query)]));

      console.groupEnd();
    }

    if (error) {
      console.error(...format(['Error', headerStyles]), serializeError(error));
    } else if (result) {
      console.log(
        ...format(['Result', headerStyles]),
        stringifyJSONIfEnabled(result)
      );
    }

    if (options.showSelections) {
      console.groupCollapsed(...format(['Selections', headerStyles]));
      selections.forEach(({ key, cacheKeys, alias, input, isUnion }) => {
        console.log(
          stringifyJSONIfEnabled({
            key,
            cacheKeys: cacheKeys.join('.'),
            alias,
            input,
            isUnion,
          })
        );
      });
      console.groupEnd();
    }

    if (options.showCache) {
      console.log(
        ...format(['Cache snapshot', headerStyles]),
        stringifyJSONIfEnabled(cache?.toJSON())
      );
      console.groupEnd();
    }
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
