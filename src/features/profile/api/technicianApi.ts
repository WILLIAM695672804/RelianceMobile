import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  messageOnlyResponseSchema,
  technicianIdentityResponseSchema,
  technicianSkillListResponseSchema,
  technicianStatsSchema,
  type ServiceAreaPayload,
  type TechnicianIdentity,
  type TechnicianProfilePayload,
  type TechnicianSkill,
  type TechnicianSkillPayload,
  type TechnicianStats,
} from '../schemas/technicianSchemas';

const identity = (data: unknown): TechnicianIdentity =>
  parseResponse(technicianIdentityResponseSchema, data).data;
const message = (data: unknown): string => parseResponse(messageOnlyResponseSchema, data).message;

/** `GET /technician/profile`. */
export async function fetchTechnicianIdentity(client: AxiosInstance): Promise<TechnicianIdentity> {
  const { data } = await client.get('/technician/profile');
  return identity(data);
}

/** `PUT /technician/profile` : présentation et savoir-faire déclarés. */
export async function updateTechnicianProfile(
  client: AxiosInstance,
  payload: TechnicianProfilePayload,
): Promise<TechnicianIdentity> {
  const { data } = await client.put('/technician/profile', {
    bio: payload.bio,
    competences: payload.competences,
  });
  return identity(data);
}

/** `PUT /technician/location` : point PostGIS et rayon d'intervention. */
export async function updateServiceArea(
  client: AxiosInstance,
  payload: ServiceAreaPayload,
): Promise<TechnicianIdentity> {
  const { data } = await client.put('/technician/location', {
    latitude: payload.latitude,
    longitude: payload.longitude,
    address: payload.address,
    city: payload.city,
    radius: payload.radius,
    zones: payload.zones,
  });
  return identity(data);
}

/** `GET /technician/skills`. */
export async function fetchMyTechnicianSkills(client: AxiosInstance): Promise<TechnicianSkill[]> {
  const { data } = await client.get('/technician/skills');
  return parseResponse(technicianSkillListResponseSchema, data).data;
}

/** `POST /technician/skills` : ajoute ou met à jour une compétence tarifée. */
export async function addTechnicianSkill(
  client: AxiosInstance,
  payload: TechnicianSkillPayload,
): Promise<string> {
  const { data } = await client.post('/technician/skills', {
    skill_id: payload.skillId,
    proficiency: payload.proficiency,
    experience_years: payload.experienceYears,
    hourly_rate: payload.hourlyRate,
    travel_fee: payload.travelFee,
  });
  return message(data);
}

/** `DELETE /technician/skills/{id}`. */
export async function removeTechnicianSkill(
  client: AxiosInstance,
  skillId: string,
): Promise<string> {
  const { data } = await client.delete(`/technician/skills/${encodeURIComponent(skillId)}`);
  return message(data);
}

/** `GET /technician/stats` : réponse sans enveloppe `data`. */
export async function fetchTechnicianStats(client: AxiosInstance): Promise<TechnicianStats> {
  const { data } = await client.get('/technician/stats');
  return parseResponse(technicianStatsSchema, data);
}
