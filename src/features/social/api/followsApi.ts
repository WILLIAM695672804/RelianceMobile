import type { AxiosInstance } from 'axios';

import { normalizeError } from '@/core/errors';
import { parseResponse } from '@/core/api';

import {
  followCheckSchema,
  followCountsSchema,
  followResultSchema,
  suggestionsResponseSchema,
  type FollowCounts,
  type FollowSuggestion,
} from '../schemas/followSchemas';

const segment = encodeURIComponent;
/** Le serveur répond 409 lorsque le compte est déjà suivi : l'état visé est atteint. */
const CONFLICT = 409;

/** `GET /follows/{id}/check`. */
export async function checkFollow(client: AxiosInstance, userId: string): Promise<boolean> {
  const { data } = await client.get(`/follows/${segment(userId)}/check`);
  return parseResponse(followCheckSchema, data).following;
}

/** `POST /follows/{id}` : un conflit est traité comme un succès. */
export async function followUser(client: AxiosInstance, userId: string): Promise<boolean> {
  try {
    const { data } = await client.post(`/follows/${segment(userId)}`);
    return parseResponse(followResultSchema, data).following;
  } catch (error) {
    if (normalizeError(error).status === CONFLICT) return true;
    throw error;
  }
}

/** `DELETE /follows/{id}`. */
export async function unfollowUser(client: AxiosInstance, userId: string): Promise<boolean> {
  const { data } = await client.delete(`/follows/${segment(userId)}`);
  return parseResponse(followResultSchema, data).following;
}

/** `GET /users/{id}/follow-counts`. */
export async function fetchFollowCounts(
  client: AxiosInstance,
  userId: string,
): Promise<FollowCounts> {
  const { data } = await client.get(`/users/${segment(userId)}/follow-counts`);
  return parseResponse(followCountsSchema, data);
}

/** `GET /follows/suggestions`. */
export async function fetchSuggestions(client: AxiosInstance): Promise<FollowSuggestion[]> {
  const { data } = await client.get('/follows/suggestions');
  return parseResponse(suggestionsResponseSchema, data).data;
}
