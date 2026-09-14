import type { Query } from '@tanstack/react-query';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

import { createMemoryStore } from '@/core/storage';

import {
  createPersistOptions,
  createQueryPersister,
  QUERY_CACHE_KEY,
  QUERY_CACHE_MAX_AGE,
  shouldPersistQuery,
} from './persistence';

const fakeQuery = (
  meta: Record<string, unknown> | undefined,
  status: 'success' | 'error' | 'pending',
) => ({ meta, state: { status } }) as unknown as Query;

const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('shouldPersistQuery', () => {
  it('ne persiste que les requêtes réussies marquées persist', () => {
    expect(shouldPersistQuery(fakeQuery({ persist: true }, 'success'))).toBe(true);
    expect(shouldPersistQuery(fakeQuery(undefined, 'success'))).toBe(false);
    expect(shouldPersistQuery(fakeQuery({ persist: false }, 'success'))).toBe(false);
    expect(shouldPersistQuery(fakeQuery({ persist: true }, 'error'))).toBe(false);
  });
});

describe('createQueryPersister', () => {
  it('écrit, relit et supprime le cache dans le stockage', async () => {
    const store = createMemoryStore();
    const persister = createQueryPersister(store, { throttleTime: 0 });
    const client: PersistedClient = {
      timestamp: 1,
      buster: '0.1.0',
      clientState: { queries: [], mutations: [] },
    };

    await persister.persistClient(client);
    await flush();
    expect(store.getString(QUERY_CACHE_KEY)).toBeDefined();
    await expect(persister.restoreClient()).resolves.toEqual(client);

    await persister.removeClient();
    expect(store.getString(QUERY_CACHE_KEY)).toBeUndefined();
  });
});

describe('createPersistOptions', () => {
  it('fixe la durée maximale, le buster et le filtre de persistance', () => {
    const persister = createQueryPersister(createMemoryStore());
    const options = createPersistOptions(persister, '0.1.0');
    expect(options).toMatchObject({ persister, maxAge: QUERY_CACHE_MAX_AGE, buster: '0.1.0' });
    expect(options.dehydrateOptions?.shouldDehydrateQuery).toBe(shouldPersistQuery);
  });
});
