import { useSyncedRef } from './hooks';
import { useMemo, useRef, useState } from 'react';

export type AsyncStatus = 'loading' | 'success' | 'error' | 'not-executed';

export type AsyncState<Result> =
  | {
      status: 'not-executed';
      error: undefined;
      result: Result;
    }
  | {
      status: 'success';
      error: undefined;
      result: Result;
    }
  | {
      status: 'error';
      error: Error;
      result: Result;
    }
  | {
      status: AsyncStatus;
      error: Error | undefined;
      result: Result;
    };

export interface UseAsyncActions<Result, Args extends unknown[] = unknown[]> {
  /**
   * Reset state to initial.
   */
  reset: () => void;
  /**
   * Execute the async function manually.
   */
  execute: (...args: Args) => Promise<Result>;
}

export interface UseAsyncMeta<Result, Args extends unknown[] = unknown[]> {
  /**
   * Latest promise returned from the async function.
   */
  promise: Promise<Result> | undefined;
  /**
   * List of arguments applied to the latest async function invocation.
   */
  lastArgs: Args | undefined;
}

/**
 * **Modified version of `useAsync` in `@react-hookz/web`**
 *
 * Tracks the result and errors of the provided async function and provides
 * handles to control its execution.
 *
 * Skips executions when an active promise is already in place.
 *
 * @param asyncFn Function that returns a promise.
 * @param initialValue Value that will be set on initialisation before the async
 * function is executed.
 */
export function useThrottledAsync<Result, Args extends unknown[] = unknown[]>(
  asyncFn: (...params: Args) => Promise<Result>,
  initialValue: Result
): [
  AsyncState<Result>,
  UseAsyncActions<Result, Args>,
  UseAsyncMeta<Result, Args>,
];
export function useThrottledAsync<Result, Args extends unknown[] = unknown[]>(
  asyncFn: (...params: Args) => Promise<Result>,
  initialValue?: Result
): [
  AsyncState<Result | undefined>,
  UseAsyncActions<Result, Args>,
  UseAsyncMeta<Result, Args>,
];
export function useThrottledAsync<Result, Args extends unknown[] = unknown[]>(
  asyncFn: (...params: Args) => Promise<Result>,
  initialValue?: Result
): [
  AsyncState<Result | undefined>,
  UseAsyncActions<Result, Args>,
  UseAsyncMeta<Result, Args>,
] {
  const [state, setState] = useState<AsyncState<Result | undefined>>({
    status: 'not-executed',
    error: undefined,
    result: initialValue,
  });
  const promiseRef = useRef<Promise<Result> | undefined>(undefined);
  const argsRef = useRef<Args | undefined>(undefined);

  const methods = useSyncedRef({
    execute: (...params: Args) => {
      if (promiseRef.current) return promiseRef.current;

      argsRef.current = params;
      const promise = asyncFn(...params);
      promiseRef.current = promise;

      setState((s) => ({ ...s, status: 'loading' }));

      promise
        .then(
          (result) => {
            if (promise === promiseRef.current) {
              setState((s) => ({
                ...s,
                status: 'success',
                error: undefined,
                result,
              }));
            }
          },
          (error: Error) => {
            if (promise === promiseRef.current) {
              setState((s) => ({ ...s, status: 'error', error }));
            }
          }
        )
        .finally(() => {
          if (promise === promiseRef.current) {
            promiseRef.current = undefined;
          }
        });

      return promise;
    },
    reset: () => {
      setState({
        status: 'not-executed',
        error: undefined,
        result: initialValue,
      });
      promiseRef.current = undefined;
      argsRef.current = undefined;
    },
  });

  return [
    state,
    useMemo(
      () => ({
        execute: (...args: Args) => methods.current.execute(...args),
        reset: () => methods.current.reset(),
      }),
      []
    ),
    { promise: promiseRef.current, lastArgs: argsRef.current },
  ];
}
