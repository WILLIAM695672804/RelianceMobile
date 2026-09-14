import { createMemoryStore } from '@/core/storage';

import { createProfileCache, PROFILE_CACHE_KEY } from './profileCache';
import type { SessionUser } from './types';

const user: SessionUser = {
  id: 'u1',
  name: 'Agence Test',
  email: 'agence@example.test',
  role: 'agence',
  emailVerified: false,
  avatarUrl: 'https://cdn.example.test/a.png',
};

describe('createProfileCache', () => {
  it('enregistre, relit et purge le profil', () => {
    const cache = createProfileCache(createMemoryStore());
    expect(cache.load()).toBeNull();
    cache.save(user);
    expect(cache.load()).toEqual(user);
    cache.clear();
    expect(cache.load()).toBeNull();
  });

  it('ignore un profil corrompu', () => {
    const store = createMemoryStore();
    store.set(PROFILE_CACHE_KEY, JSON.stringify({ ...user, role: 'pirate' }));
    expect(createProfileCache(store).load()).toBeNull();
  });
});
