import type { AxiosInstance } from 'axios';

import { appendFile, MULTIPART_HEADERS, parseResponse, type UploadFile } from '@/core/api';
import type { ApiUser } from '@/core/session';

import {
  avatarResponseSchema,
  locationCreatedResponseSchema,
  locationListSchema,
  messageResponseSchema,
  profileUpdateResponseSchema,
  type Location,
  type LocationPayload,
  type PasswordFormValues,
  type ProfilePayload,
  type UpgradePayload,
} from '../schemas/profileSchemas';

/** Corps de `PUT /auth/profile/password`. */
export type PasswordPayload = PasswordFormValues;

const message = (data: unknown) => parseResponse(messageResponseSchema, data).message;

/** `PUT /auth/profile` : utilisateur mis à jour. */
export async function updateProfile(
  client: AxiosInstance,
  payload: ProfilePayload,
): Promise<ApiUser> {
  const { data } = await client.put('/auth/profile', payload);
  return parseResponse(profileUpdateResponseSchema, data).user;
}

/** `PUT /auth/profile/password`. */
export async function changePassword(
  client: AxiosInstance,
  payload: PasswordPayload,
): Promise<string> {
  const { data } = await client.put('/auth/profile/password', payload);
  return message(data);
}

/** `POST /auth/profile/avatar` (multipart, champ `avatar`) : URL du nouvel avatar. */
export async function uploadAvatar(client: AxiosInstance, file: UploadFile): Promise<string> {
  const form = new FormData();
  appendFile(form, 'avatar', file);
  const { data } = await client.post('/auth/profile/avatar', form, { headers: MULTIPART_HEADERS });
  return parseResponse(avatarResponseSchema, data).avatar_url;
}

/** `GET /locations` : adresses, la principale en tête. */
export async function fetchLocations(client: AxiosInstance): Promise<Location[]> {
  const { data } = await client.get('/locations');
  return parseResponse(locationListSchema, data);
}

/** `POST /locations`. */
export async function createLocation(
  client: AxiosInstance,
  payload: LocationPayload,
): Promise<Location> {
  const { data } = await client.post('/locations', payload);
  return parseResponse(locationCreatedResponseSchema, data).location;
}

/** `DELETE /locations/{id}`. */
export async function deleteLocation(client: AxiosInstance, id: string): Promise<string> {
  const { data } = await client.delete(`/locations/${encodeURIComponent(id)}`);
  return message(data);
}

/** `PATCH /locations/{id}/default`. */
export async function setDefaultLocation(client: AxiosInstance, id: string): Promise<string> {
  const { data } = await client.patch(`/locations/${encodeURIComponent(id)}/default`);
  return message(data);
}

/** `POST /auth/request-upgrade` : demande de passage au rôle technicien. */
export async function requestUpgrade(
  client: AxiosInstance,
  payload: UpgradePayload,
): Promise<string> {
  const { data } = await client.post('/auth/request-upgrade', payload);
  return message(data);
}
