import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createFakeRealtimeClient } from '@/test/fakeRealtime';

import { channels, type ChannelRef } from './channels';
import { RealtimeProvider } from './RealtimeProvider';
import { createRealtimeService } from './realtimeService';
import { useChannelEvent } from './useChannelEvent';

function setup() {
  const fake = createFakeRealtimeClient();
  const service = createRealtimeService(() => fake.client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RealtimeProvider service={service}>{children}</RealtimeProvider>
  );
  return { ...fake, service, wrapper };
}

describe('useChannelEvent', () => {
  it('s’abonne dès que le service démarre et relaie les événements', async () => {
    const { service, wrapper, channels: created } = setup();
    const handler = jest.fn();
    await renderHook(() => useChannelEvent(channels.user('u1'), 'RoleUpgradeDecision', handler), {
      wrapper,
    });

    await act(async () => {
      service.start();
    });
    created.get('user.u1')?.emit('RoleUpgradeDecision', { decision: 'approved' });

    expect(handler).toHaveBeenCalledWith({ decision: 'approved' });
  });

  it('se désabonne au démontage', async () => {
    const { service, wrapper, client } = setup();
    service.start();
    const { unmount } = await renderHook(
      () => useChannelEvent(channels.user('u1'), 'KycStatusChanged', jest.fn()),
      { wrapper },
    );

    await unmount();

    expect(client.echo.leave).toHaveBeenCalledWith('user.u1');
  });

  it('ne s’abonne pas sans canal', async () => {
    const { service, wrapper, privateChannel } = setup();
    service.start();
    await renderHook(() => useChannelEvent(null, 'KycStatusChanged', jest.fn()), { wrapper });
    expect(privateChannel).not.toHaveBeenCalled();
  });

  it('utilise le dernier gestionnaire sans se réabonner', async () => {
    const { service, wrapper, privateChannel, channels: created } = setup();
    service.start();
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = await renderHook(
      ({ handler, channel }: { handler: jest.Mock; channel: ChannelRef<'user'> }) =>
        useChannelEvent(channel, 'KycStatusChanged', handler),
      { wrapper, initialProps: { handler: first, channel: channels.user('u1') } },
    );

    await rerender({ handler: second, channel: channels.user('u1') });
    created.get('user.u1')?.emit('KycStatusChanged', { status: 'approved' });

    expect(privateChannel).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ status: 'approved' });
  });
});
