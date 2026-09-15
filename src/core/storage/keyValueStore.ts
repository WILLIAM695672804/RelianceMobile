import type { z } from 'zod';

/** Stockage clé-valeur synchrone de chaînes (MMKV en production, mémoire en test). */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Crée un stockage en mémoire, destiné aux tests. */
export function createMemoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getString: (key) => data.get(key),
    set: (key, value) => {
      data.set(key, value);
    },
    remove: (key) => {
      data.delete(key);
    },
  };
}

/**
 * Relit une valeur JSON validée par `schema`.
 * Une valeur illisible ou non conforme est purgée et `null` est renvoyé.
 */
export function readJson<T>(store: KeyValueStore, key: string, schema: z.ZodType<T>): T | null {
  const raw = store.getString(key);
  if (raw === undefined) return null;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (result.success) return result.data;
  } catch {
    // JSON illisible : purge ci-dessous.
  }
  store.remove(key);
  return null;
}

/** Sérialise `value` en JSON sous `key`. */
export function writeJson(store: KeyValueStore, key: string, value: unknown): void {
  store.set(key, JSON.stringify(value));
}
