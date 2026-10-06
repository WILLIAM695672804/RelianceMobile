import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  agencyResponseSchema,
  membersResponseSchema,
  messageResponseSchema,
  myAgencyResponseSchema,
  writtenAgencyResponseSchema,
  type Agency,
  type AgencyMembership,
  type AgencyPayload,
  type MemberPayload,
} from '../schemas/agencySchemas';

const segment = encodeURIComponent;
const message = (data: unknown): string => parseResponse(messageResponseSchema, data).message;

/** Corps d'écriture : les champs vides ne sont pas transmis. */
const toBody = (payload: AgencyPayload): Record<string, unknown> => {
  const body: Record<string, unknown> = { name: payload.name };
  if (payload.description) body.description = payload.description;
  if (payload.address) body.address = payload.address;
  if (payload.phone) body.phone = payload.phone;
  if (payload.email) body.email = payload.email;
  return body;
};

/** `GET /my-agency` : agence de l'utilisateur, ou `null`. */
export async function fetchMyAgency(client: AxiosInstance): Promise<Agency | null> {
  const { data } = await client.get('/my-agency');
  return parseResponse(myAgencyResponseSchema, data).data;
}

/** `GET /agencies/{id}`. */
export async function fetchAgency(client: AxiosInstance, agencyId: string): Promise<Agency> {
  const { data } = await client.get(`/agencies/${segment(agencyId)}`);
  return parseResponse(agencyResponseSchema, data).data;
}

/** `POST /agencies` : le créateur devient administrateur. */
export async function createAgency(client: AxiosInstance, payload: AgencyPayload): Promise<Agency> {
  const { data } = await client.post('/agencies', toBody(payload));
  return parseResponse(writtenAgencyResponseSchema, data).data;
}

/** `PUT /agencies/{id}`. */
export async function updateAgency(
  client: AxiosInstance,
  agencyId: string,
  payload: AgencyPayload,
): Promise<Agency> {
  const { data } = await client.put(`/agencies/${segment(agencyId)}`, toBody(payload));
  return parseResponse(writtenAgencyResponseSchema, data).data;
}

/** `GET /agencies/{id}/members` : adhésions avec leur rôle. */
export async function fetchAgencyMembers(
  client: AxiosInstance,
  agencyId: string,
): Promise<AgencyMembership[]> {
  const { data } = await client.get(`/agencies/${segment(agencyId)}/members`);
  return parseResponse(membersResponseSchema, data).data;
}

/** `POST /agencies/{id}/members`. */
export async function addAgencyMember(
  client: AxiosInstance,
  agencyId: string,
  payload: MemberPayload,
): Promise<string> {
  const { data } = await client.post(`/agencies/${segment(agencyId)}/members`, {
    user_id: payload.userId,
    role: payload.role,
  });
  return message(data);
}

/** `DELETE /agencies/{id}/members/{userId}`. */
export async function removeAgencyMember(
  client: AxiosInstance,
  agencyId: string,
  userId: string,
): Promise<string> {
  const { data } = await client.delete(`/agencies/${segment(agencyId)}/members/${segment(userId)}`);
  return message(data);
}
