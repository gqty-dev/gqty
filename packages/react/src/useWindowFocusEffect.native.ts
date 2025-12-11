import { useEffect, type DependencyList } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type UseFocusChangeEffectOptions = {
  enabled?: boolean;
};

export const useWindowFocusEffect = (
  fn: (...args: unknown[]) => unknown,
  deps: DependencyList = [],
  { enabled = true }: UseFocusChangeEffectOptions = {}
) => {
  useEffect(
    () => {
      if (!enabled) return;

      let previousState: AppStateStatus = AppState.currentState;

      const onChange = (nextState: AppStateStatus) => {
        if (
          previousState.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          fn();
        }

        previousState = nextState;
      };

      const subscription = AppState.addEventListener('change', onChange);

      return () => {
        subscription.remove();
      };
    },
    deps.concat(fn, enabled)
  );
};
