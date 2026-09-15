import { act } from '@testing-library/react-native';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { RealtimeBridge } from './RealtimeBridge';

describe('RealtimeBridge', () => {
  it('rafraîchit la session à la décision de changement de rôle', async () => {
    const fake = createFakeRealtimeClient();
    const realtime = createRealtimeService(() => fake.client);
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('client', { id: 'u1' }));
    realtime.start();
    const restore = jest.fn(async () => 'authenticated' as const);

    await renderWithProviders(<RealtimeBridge />, {
      realtime,
      sessionStore,
      sessionActions: { restore },
    });
    await act(async () => {
      fake.channels
        .get('user.u1')
        ?.emit('RoleUpgradeDecision', { decision: 'approved', type: 'role_upgrade' });
    });

    expect(restore).toHaveBeenCalledTimes(1);
  });
});
