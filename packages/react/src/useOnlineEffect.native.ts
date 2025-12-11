import { useEffect, type DependencyList } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export const useOnlineEffect = (
  fn: (...args: unknown[]) => unknown,
  deps?: DependencyList
) => {
  useEffect(() => {
    let previousState: AppStateStatus = AppState.currentState;

    const handleChange = (nextState: AppStateStatus) => {
      if (
        previousState.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        fn();
      }

      previousState = nextState;
    };

    const subscription = AppState.addEventListener('change', handleChange);

    return () => {
      subscription.remove();
    };
  }, deps);
};
