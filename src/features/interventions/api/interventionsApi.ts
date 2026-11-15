import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  interventionListResponseSchema,
  interventionResponseSchema,
  type Intervention,
  type ReportPayload,
} from '../schemas/interventionSchemas';

const segment = encodeURIComponent;

/** `GET /interventions` : le serveur restreint la liste au technicien connecté. */
export async function fetchInterventions(client: AxiosInstance): Promise<Intervention[]> {
  const { data } = await client.get('/interventions');
  return parseResponse(interventionListResponseSchema, data).data.data;
}

/** `GET /interventions/{id}` : accessible aux deux parties de la mission. */
export async function fetchIntervention(client: AxiosInstance, id: string): Promise<Intervention> {
  const { data } = await client.get(`/interventions/${segment(id)}`);
  return parseResponse(interventionResponseSchema, data).data;
}

/** `POST /interventions` : ouvre le rapport d'une mission acceptée. */
export async function createIntervention(
  client: AxiosInstance,
  input: { jobId: string; requestId: string; description?: string },
): Promise<Intervention> {
  const body: Record<string, unknown> = { job_id: input.jobId, request_id: input.requestId };
  if (input.description) body.description = input.description;
  const { data } = await client.post('/interventions', body);
  return parseResponse(interventionResponseSchema, data).data;
}

/** `POST /interventions/{id}/start`. */
export async function startIntervention(client: AxiosInstance, id: string): Promise<Intervention> {
  const { data } = await client.post(`/interventions/${segment(id)}/start`, {});
  return parseResponse(interventionResponseSchema, data).data;
}

/** `POST /interventions/{id}/complete` : les champs absents ne sont pas envoyés. */
export async function completeIntervention(
  client: AxiosInstance,
  id: string,
  payload: ReportPayload,
): Promise<Intervention> {
  const body: Record<string, unknown> = { work_performed: payload.workPerformed };
  if (payload.materials.length > 0) body.materials_used = payload.materials;
  if (payload.hours !== null) body.duration_hours = payload.hours;
  if (payload.notes !== null) body.notes = payload.notes;
  const { data } = await client.post(`/interventions/${segment(id)}/complete`, body);
  return parseResponse(interventionResponseSchema, data).data;
}
