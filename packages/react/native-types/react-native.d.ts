declare module 'react-native' {
  export type AppStateStatus = 'active' | 'background' | 'inactive' | 'unknown';

  export const AppState: {
    currentState: AppStateStatus;
    addEventListener(
      type: 'change',
      listener: (status: AppStateStatus) => void
    ): { remove(): void };
  };
}
