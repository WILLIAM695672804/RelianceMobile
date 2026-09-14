import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

import { testEnv } from '@/test/fixtures/env';

import { createPusherOptions, createRealtimeClient } from './pusherClient';

jest.mock('pusher-js/react-native', () =>
  jest.fn().mockImplementation(() => ({ connect: jest.fn(), disconnect: jest.fn() })),
);
jest.mock('laravel-echo', () =>
  jest.fn().mockImplementation(() => ({ private: jest.fn(), leave: jest.fn() })),
);

describe('createPusherOptions', () => {
  it('cible le serveur WebSocket configuré', () => {
    const options = createPusherOptions({ env: testEnv, authorize: jest.fn() });
    expect(options).toMatchObject({
      wsHost: 'api.test',
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
    });
  });

  it('autorise les canaux privés via la fonction fournie', async () => {
    const authorize = jest.fn(async () => ({ auth: 'reliance-key:signature' }));
    const handler = createPusherOptions({ env: testEnv, authorize }).channelAuthorization
      ?.customHandler;
    const callback = jest.fn();

    handler?.({ socketId: '1.2', channelName: 'private-user.u1' }, callback);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(authorize).toHaveBeenCalledWith('1.2', 'private-user.u1');
    expect(callback).toHaveBeenCalledWith(null, { auth: 'reliance-key:signature' });
  });

  it('transmet l’échec d’autorisation à Pusher', async () => {
    const authorize = jest.fn(async () => {
      throw new Error('403');
    });
    const handler = createPusherOptions({ env: testEnv, authorize }).channelAuthorization
      ?.customHandler;
    const callback = jest.fn();

    handler?.({ socketId: '1.2', channelName: 'private-user.u1' }, callback);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
  });
});

describe('createRealtimeClient', () => {
  it('fournit le client Pusher à Echo et pilote sa connexion', () => {
    const client = createRealtimeClient({ env: testEnv, authorize: jest.fn() });
    const pusherInstance = (Pusher as unknown as jest.Mock).mock.results[0]?.value;

    expect(Pusher).toHaveBeenCalledWith(
      'reliance-key',
      expect.objectContaining({ wsHost: 'api.test' }),
    );
    expect(Echo).toHaveBeenCalledWith(
      expect.objectContaining({
        broadcaster: 'pusher',
        client: pusherInstance,
        withoutInterceptors: true,
      }),
    );

    client.connection.disconnect();
    client.connection.connect();
    expect(pusherInstance.disconnect).toHaveBeenCalled();
    expect(pusherInstance.connect).toHaveBeenCalled();
  });
});
