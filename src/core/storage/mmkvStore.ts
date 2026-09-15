import { createMMKV } from 'react-native-mmkv';

import type { KeyValueStore } from './keyValueStore';

/** Crée un stockage MMKV isolé sous l'identifiant `id`. */
export function createMmkvStore(id: string): KeyValueStore {
  const mmkv = createMMKV({ id });
  return {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    remove: (key) => {
      mmkv.remove(key);
    },
  };
}
