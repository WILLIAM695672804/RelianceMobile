import { z } from 'zod';

import { readJson, writeJson, type KeyValueStore } from '@/core/storage';

import type { SessionUser } from './types';

export const PROFILE_CACHE_KEY = 'reliance.session.profile';

const cachedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['client', 'technicien', 'agence', 'admin', 'unknown']),
  emailVerified: z.boolean(),
  avatarUrl: z.string().nullable(),
});

/** Profil minimal conservé pour le mode dégradé hors ligne. */
export interface ProfileCache {
  save(user: SessionUser): void;
  load(): SessionUser | null;
  clear(): void;
}

export function createProfileCache(store: KeyValueStore): ProfileCache {
  return {
    save: (user) => writeJson(store, PROFILE_CACHE_KEY, user),
    load: () => readJson(store, PROFILE_CACHE_KEY, cachedUserSchema),
    clear: () => store.remove(PROFILE_CACHE_KEY),
  };
}
