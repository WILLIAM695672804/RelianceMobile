import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';

import type { ChannelEvent, ChannelKind, ChannelRef } from './channels';
import { useRealtime } from './RealtimeProvider';
import type { EventHandler } from './realtimeService';

/**
 * Écoute `event` sur `channel` tant que le composant est monté et que le temps réel est démarré.
 * Le gestionnaire le plus récent est toujours appelé, sans réabonnement.
 * @param channel `null` pour ne pas s'abonner (utilisateur non encore connu, par exemple).
 */
export function useChannelEvent<K extends ChannelKind>(
  channel: ChannelRef<K> | null,
  event: ChannelEvent<K>,
  handler: EventHandler,
): void {
  const service = useRealtime();
  const client = useStore(service.store, (state) => state.client);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const kind = channel?.kind;
  const id = channel?.id;

  useEffect(() => {
    if (!client || kind === undefined || id === undefined) return undefined;
    return service.subscribe({ kind, id }, event, (payload) => handlerRef.current(payload));
  }, [service, client, kind, id, event]);
}
