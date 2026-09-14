import { z } from 'zod';

import { createMemoryStore, readJson, writeJson } from './keyValueStore';
import { createMmkvStore } from './mmkvStore';

const itemSchema = z.object({ id: z.string() });

describe('createMemoryStore', () => {
  it('écrit, relit et supprime une valeur', () => {
    const store = createMemoryStore();
    store.set('clé', 'valeur');
    expect(store.getString('clé')).toBe('valeur');
    store.remove('clé');
    expect(store.getString('clé')).toBeUndefined();
  });
});

describe('readJson / writeJson', () => {
  it('relit une valeur conforme au schéma', () => {
    const store = createMemoryStore();
    writeJson(store, 'item', { id: 'a1' });
    expect(readJson(store, 'item', itemSchema)).toEqual({ id: 'a1' });
  });

  it('renvoie null pour une clé absente', () => {
    expect(readJson(createMemoryStore(), 'absente', itemSchema)).toBeNull();
  });

  it('renvoie null et purge une valeur qui n’est pas du JSON', () => {
    const store = createMemoryStore();
    store.set('item', '{pas du json');
    expect(readJson(store, 'item', itemSchema)).toBeNull();
    expect(store.getString('item')).toBeUndefined();
  });

  it('renvoie null et purge une valeur non conforme au schéma', () => {
    const store = createMemoryStore();
    writeJson(store, 'item', { id: 42 });
    expect(readJson(store, 'item', itemSchema)).toBeNull();
    expect(store.getString('item')).toBeUndefined();
  });
});

describe('createMmkvStore', () => {
  it('délègue à MMKV (instance en mémoire sous Jest)', () => {
    const store = createMmkvStore('reliance.test');
    store.set('clé', 'valeur');
    expect(store.getString('clé')).toBe('valeur');
    store.remove('clé');
    expect(store.getString('clé')).toBeUndefined();
  });
});
