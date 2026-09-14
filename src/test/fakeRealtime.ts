import type { RealtimeClient } from '@/core/realtime/realtimeService';

export interface FakeChannel {
  listen: jest.Mock;
  stopListening: jest.Mock;
  /** Déclenche le dernier gestionnaire enregistré pour `event`. */
  emit(event: string, payload: unknown): void;
}

export function createFakeRealtimeClient() {
  const channels = new Map<string, FakeChannel>();
  const privateChannel = jest.fn((name: string) => {
    const existing = channels.get(name);
    if (existing) return existing;
    const channel: FakeChannel = {
      listen: jest.fn(),
      stopListening: jest.fn(),
      emit(event, payload) {
        const call = [...channel.listen.mock.calls]
          .reverse()
          .find(([registered]) => registered === event);
        (call?.[1] as ((data: unknown) => void) | undefined)?.(payload);
      },
    };
    channels.set(name, channel);
    return channel;
  });
  const client: RealtimeClient = {
    echo: { private: privateChannel, leave: jest.fn() },
    connection: { connect: jest.fn(), disconnect: jest.fn() },
  };
  return { client, channels, privateChannel };
}
