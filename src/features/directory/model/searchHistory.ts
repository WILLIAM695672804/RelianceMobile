import { z } from 'zod';

import { readJson, writeJson, type KeyValueStore } from '@/core/storage';

const KEY = 'directory.search.history';
const schema = z.array(z.string());

/** Nombre de recherches conservées, comme dans la maquette `SearchScreen`. */
export const HISTORY_LIMIT = 6;

export interface SearchHistory {
  read: () => string[];
  remember: (term: string) => void;
  forget: (term: string) => void;
  clear: () => void;
}

/** Historique local des recherches ; il ne quitte jamais l'appareil. */
export function createSearchHistory(store: KeyValueStore): SearchHistory {
  const read = () => readJson(store, KEY, schema) ?? [];
  const write = (terms: string[]) => writeJson(store, KEY, terms);
  return {
    read,
    remember: (term) => {
      const trimmed = term.trim();
      if (trimmed === '') return;
      write([trimmed, ...read().filter((entry) => entry !== trimmed)].slice(0, HISTORY_LIMIT));
    },
    forget: (term) => write(read().filter((entry) => entry !== term)),
    clear: () => store.remove(KEY),
  };
}
