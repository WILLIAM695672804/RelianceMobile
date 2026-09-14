import { act, renderHook } from '@testing-library/react-native';
import { onlineManager } from '@tanstack/react-query';

import {
  connectivityStore,
  isOnline,
  startConnectivitySync,
  useIsOnline,
  type NetworkState,
} from './connectivity';

function fakeNetInfo() {
  let listener: ((state: NetworkState) => void) | undefined;
  const unsubscribe = jest.fn();
  return {
    subscribe: (next: (state: NetworkState) => void) => {
      listener = next;
      return unsubscribe;
    },
    emit: (state: NetworkState) => listener?.(state),
  };
}

afterEach(() => {
  onlineManager.setOnline(true);
  connectivityStore.setState({ isOnline: true });
});

describe('isOnline', () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, true],
    [{ isConnected: true, isInternetReachable: null }, true],
    [{ isConnected: true, isInternetReachable: false }, false],
    [{ isConnected: false, isInternetReachable: null }, false],
    [{ isConnected: null, isInternetReachable: null }, false],
  ])('%j → %s', (state, expected) => {
    expect(isOnline(state)).toBe(expected);
  });
});

describe('startConnectivitySync', () => {
  it('propage l’état réseau à onlineManager et au store', () => {
    const netInfo = fakeNetInfo();
    startConnectivitySync(netInfo.subscribe);

    netInfo.emit({ isConnected: false, isInternetReachable: false });
    expect(onlineManager.isOnline()).toBe(false);
    expect(connectivityStore.getState().isOnline).toBe(false);

    netInfo.emit({ isConnected: true, isInternetReachable: true });
    expect(onlineManager.isOnline()).toBe(true);
    expect(connectivityStore.getState().isOnline).toBe(true);
  });
});

describe('useIsOnline', () => {
  it('reflète le store de connectivité', async () => {
    const { result } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(true);

    await act(async () => {
      connectivityStore.setState({ isOnline: false });
    });

    expect(result.current).toBe(false);
  });
});
