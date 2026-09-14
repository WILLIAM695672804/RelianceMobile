import { createFakeRealtimeClient } from '@/test/fakeRealtime';

import { channels } from './channels';
import { createRealtimeService } from './realtimeService';

function setup() {
  const fake = createFakeRealtimeClient();
  const factory = jest.fn(() => fake.client);
  return { ...fake, factory, service: createRealtimeService(factory) };
}

describe('createRealtimeService', () => {
  it('ignore les abonnements tant que le service n’est pas démarré', () => {
    const { service, factory } = setup();
    const unsubscribe = service.subscribe(channels.user('u1'), 'RoleUpgradeDecision', jest.fn());
    expect(factory).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
  });

  it('crée le client une seule fois', () => {
    const { service, factory } = setup();
    service.start();
    service.start();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(service.store.getState().client).not.toBeNull();
  });

  it('écoute l’événement par son nom de classe, sans point initial', () => {
    const { service, privateChannel, channels: created } = setup();
    service.start();
    const handler = jest.fn();

    service.subscribe(channels.user('u1'), 'RoleUpgradeDecision', handler);

    expect(privateChannel).toHaveBeenCalledWith('user.u1');
    expect(created.get('user.u1')?.listen).toHaveBeenCalledWith('RoleUpgradeDecision', handler);
  });

  it('ne quitte le canal qu’au départ du dernier abonné', () => {
    const { service, client, channels: created } = setup();
    service.start();
    const ref = channels.wallet('u1');
    const first = service.subscribe(ref, 'BalanceUpdated', jest.fn());
    const second = service.subscribe(ref, 'PaymentSettled', jest.fn());
    expect(service.subscriberCount(ref)).toBe(2);

    first();
    first();
    expect(created.get('wallet.u1')?.stopListening).toHaveBeenCalledTimes(1);
    expect(client.echo.leave).not.toHaveBeenCalled();
    expect(service.subscriberCount(ref)).toBe(1);

    second();
    expect(client.echo.leave).toHaveBeenCalledWith('wallet.u1');
    expect(service.subscriberCount(ref)).toBe(0);
  });

  it('stop quitte tous les canaux, déconnecte et oublie le client', () => {
    const { service, client } = setup();
    service.start();
    service.subscribe(channels.user('u1'), 'KycStatusChanged', jest.fn());
    service.subscribe(channels.notifications('u1'), 'NotificationCreated', jest.fn());

    service.stop();

    expect(client.echo.leave).toHaveBeenCalledWith('user.u1');
    expect(client.echo.leave).toHaveBeenCalledWith('notifications.u1');
    expect(client.connection.disconnect).toHaveBeenCalled();
    expect(service.store.getState().client).toBeNull();
    expect(service.subscriberCount(channels.user('u1'))).toBe(0);
  });

  it('pause et resume pilotent la connexion sans perdre les abonnements', () => {
    const { service, client } = setup();
    service.pause();
    service.start();
    service.pause();
    service.resume();
    expect(client.connection.disconnect).toHaveBeenCalledTimes(1);
    expect(client.connection.connect).toHaveBeenCalledTimes(1);
  });
});
