import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export type NetworkState = Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>;
type Subscribe = (listener: (state: NetworkState) => void) => () => void;

/** En ligne si connecté et si l'accès à Internet n'est pas explicitement infirmé. */
export function isOnline(state: NetworkState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

/** État de connectivité de l'appareil (singleton). */
export const connectivityStore = createStore<{ isOnline: boolean }>(() => ({ isOnline: true }));

/**
 * Relie NetInfo à `onlineManager` (pause et reprise des requêtes et mutations) et au store.
 * À appeler une fois au démarrage.
 */
export function startConnectivitySync(subscribe: Subscribe = NetInfo.addEventListener): void {
  onlineManager.setEventListener((setOnline) =>
    subscribe((state) => {
      const online = isOnline(state);
      connectivityStore.setState({ isOnline: online });
      setOnline(online);
    }),
  );
}

/** Vrai si l'appareil est en ligne. */
export function useIsOnline(): boolean {
  return useStore(connectivityStore, (state) => state.isOnline);
}
