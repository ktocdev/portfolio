import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/**
 * False on the server and during hydration, true after. For UI that must not
 * be in the server HTML because nothing could take it down before the app's
 * script arrives.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}
