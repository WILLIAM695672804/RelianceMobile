import { AppState, type AppStateStatus } from 'react-native';

import type { RealtimeService } from './realtimeService';

export const BACKGROUND_DISCONNECT_DELAY_MS = 30_000;

export interface AppStateLifecycleDeps {
  service: Pick<RealtimeService, 'pause' | 'resume'>;
  addListener?: (listener: (state: AppStateStatus) => void) => { remove(): void };
  delayMs?: number;
}

/**
 * Suspend la connexion temps réel après un délai en arrière-plan et la reprend au premier plan.
 * @returns fonction de détachement.
 */
export function bindAppStateLifecycle({
  service,
  addListener = (listener) => AppState.addEventListener('change', listener),
  delayMs = BACKGROUND_DISCONNECT_DELAY_MS,
}: AppStateLifecycleDeps): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let paused = false;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const subscription = addListener((state) => {
    if (state === 'active') {
      clearTimer();
      if (paused) {
        paused = false;
        service.resume();
      }
      return;
    }
    if (state === 'background' && !timer && !paused) {
      timer = setTimeout(() => {
        timer = null;
        paused = true;
        service.pause();
      }, delayMs);
    }
  });

  return () => {
    clearTimer();
    subscription.remove();
  };
}
