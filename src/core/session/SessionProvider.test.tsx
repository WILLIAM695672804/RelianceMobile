import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  SessionProvider,
  useSession,
  useSessionActions,
  type SessionActions,
} from './SessionProvider';
import { createSessionStore } from './store';

function setup() {
  const store = createSessionStore();
  const actions: SessionActions = {
    restore: jest.fn(async () => 'unauthenticated' as const),
    signIn: jest.fn(),
    logout: jest.fn(async () => undefined),
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SessionProvider store={store} actions={actions}>
      {children}
    </SessionProvider>
  );
  return { store, actions, wrapper };
}

describe('SessionProvider', () => {
  it('expose l’état de session et réagit à ses changements', async () => {
    const { store, wrapper } = setup();
    const { result } = await renderHook(() => useSession((state) => state.status), { wrapper });
    expect(result.current).toBe('unknown');

    await act(async () => {
      store.getState().setUnauthenticated();
    });

    expect(result.current).toBe('unauthenticated');
  });

  it('expose les actions de session', async () => {
    const { actions, wrapper } = setup();
    const { result } = await renderHook(() => useSessionActions(), { wrapper });
    expect(result.current).toBe(actions);
  });

  it('refuse un usage hors fournisseur', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useSessionActions())).rejects.toThrow(
      'Les hooks de session doivent être utilisés sous <SessionProvider>.',
    );
    jest.restoreAllMocks();
  });
});
