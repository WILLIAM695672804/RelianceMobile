import Echo from 'laravel-echo';
import * as pusherModule from 'pusher-js/react-native';
import type { ChannelAuthorizationHandler, Options } from 'pusher-js/react-native';

import type { AppEnv } from '@/core/config/env';

import type { EchoChannelSource, RealtimeClient } from './realtimeService';

/** Réponse de `POST /broadcasting/auth`. */
export interface ChannelAuthData {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
}

export interface RealtimeClientDeps {
  env: AppEnv;
  /** Autorise un canal privé via le client HTTP authentifié (cookie, CSRF, Origin). */
  authorize: (socketId: string, channelName: string) => Promise<ChannelAuthData>;
}

/** Options Pusher dont l'autorisation des canaux passe par un gestionnaire personnalisé. */
export type PusherOptions = Options & {
  channelAuthorization: { customHandler: ChannelAuthorizationHandler };
};

export function createPusherOptions({ env, authorize }: RealtimeClientDeps): PusherOptions {
  return {
    cluster: 'mt1',
    wsHost: env.wsHost,
    wsPort: env.wsPort,
    wssPort: env.wsPort,
    forceTLS: env.env === 'production',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    channelAuthorization: {
      // `POST /broadcasting/auth` est appelé par `authorize` via le client HTTP authentifié.
      customHandler: ({ socketId, channelName }, callback) => {
        authorize(socketId, channelName)
          .then((data) => callback(null, data))
          .catch((error: unknown) =>
            callback(error instanceof Error ? error : new Error(String(error)), null),
          );
      },
    },
  };
}

type PusherConstructor = typeof pusherModule.default;

/**
 * Constructeur Pusher, quel que soit l'export retenu : la version React Native de pusher-js 8.6
 * n'expose à l'exécution que `module.exports.Pusher`, alors que ses types déclarent un export
 * par défaut ; l'import par défaut renvoyait l'objet module (« cannot be used as a constructor »).
 */
export function resolvePusherConstructor(mod: unknown): PusherConstructor {
  const candidates = mod as { Pusher?: unknown; default?: unknown };
  const nested = candidates.default as { Pusher?: unknown } | undefined;
  const found = [candidates.Pusher, nested?.Pusher, candidates.default, mod].find(
    (candidate) => typeof candidate === 'function',
  );
  if (!found) throw new Error('pusher-js : constructeur introuvable.');
  return found as PusherConstructor;
}

/** Crée la connexion Pusher et l'instance Echo associée (laravel-websockets). */
export function createRealtimeClient(deps: RealtimeClientDeps): RealtimeClient {
  const Pusher = resolvePusherConstructor(pusherModule);
  const pusher = new Pusher(deps.env.wsKey, createPusherOptions(deps));
  const echo = new Echo<'pusher'>({
    broadcaster: 'pusher',
    key: deps.env.wsKey,
    client: pusher,
    withoutInterceptors: true,
  });
  return {
    echo: echo as unknown as EchoChannelSource,
    connection: {
      connect: () => pusher.connect(),
      disconnect: () => pusher.disconnect(),
    },
  };
}
