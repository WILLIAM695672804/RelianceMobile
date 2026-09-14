import { createStore, type StoreApi } from 'zustand/vanilla';

import { channelName, type ChannelEvent, type ChannelKind, type ChannelRef } from './channels';

export type EventHandler = (payload: unknown) => void;

/** Sous-ensemble d'Echo utilisé par le service. */
export interface EchoChannelSource {
  private(name: string): {
    listen(event: string, handler: EventHandler): unknown;
    stopListening(event: string, handler?: EventHandler): unknown;
  };
  leave(name: string): void;
}

export interface RealtimeClient {
  echo: EchoChannelSource;
  connection: { connect(): void; disconnect(): void };
}

export interface RealtimeState {
  client: RealtimeClient | null;
}

export interface RealtimeService {
  /** Store réactif : `client` non nul lorsque le service est démarré. */
  readonly store: StoreApi<RealtimeState>;
  /** Crée la connexion (après authentification) ; idempotent. */
  start(): void;
  /** Quitte tous les canaux et détruit la connexion (déconnexion). */
  stop(): void;
  /** Suspend la connexion sans perdre les abonnements (arrière-plan). */
  pause(): void;
  resume(): void;
  /** Écoute `event` sur `channel` ; renvoie la fonction de désabonnement (idempotente). */
  subscribe<K extends ChannelKind>(
    channel: ChannelRef<K>,
    event: ChannelEvent<K>,
    handler: EventHandler,
  ): () => void;
  subscriberCount(channel: ChannelRef): number;
}

export function createRealtimeService(factory: () => RealtimeClient): RealtimeService {
  const store = createStore<RealtimeState>(() => ({ client: null }));
  const refCounts = new Map<string, number>();

  return {
    store,
    start() {
      if (!store.getState().client) store.setState({ client: factory() });
    },
    stop() {
      const client = store.getState().client;
      if (!client) return;
      for (const name of refCounts.keys()) client.echo.leave(name);
      refCounts.clear();
      client.connection.disconnect();
      store.setState({ client: null });
    },
    pause() {
      store.getState().client?.connection.disconnect();
    },
    resume() {
      store.getState().client?.connection.connect();
    },
    subscribe(channel, event, handler) {
      const client = store.getState().client;
      if (!client) return () => undefined;

      const name = channelName(channel);
      const echoChannel = client.echo.private(name);
      // Sans point initial : Echo préfixe l'espace de noms « App.Events » → App\Events\<Classe>.
      echoChannel.listen(event, handler);
      refCounts.set(name, (refCounts.get(name) ?? 0) + 1);

      let active = true;
      return () => {
        if (!active || store.getState().client !== client) return;
        active = false;
        echoChannel.stopListening(event, handler);
        const remaining = (refCounts.get(name) ?? 1) - 1;
        if (remaining > 0) {
          refCounts.set(name, remaining);
        } else {
          refCounts.delete(name);
          client.echo.leave(name);
        }
      };
    },
    subscriberCount: (channel) => refCounts.get(channelName(channel)) ?? 0,
  };
}
