import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';
import type { Coordinates } from '@/shared/location';

import {
  clientMissionResponseSchema,
  jobPageSchema,
  jobResponseSchema,
  livePositionResponseSchema,
  trackingResponseSchema,
  type ClientMission,
  type Job,
  type JobPhase,
  type JobStatusPayload,
  type JobTracking,
  type LivePosition,
} from '../schemas/missionSchemas';

const segment = encodeURIComponent;
const job = (data: unknown): Job => parseResponse(jobResponseSchema, data).data;

export interface JobsResult {
  jobs: Job[];
  total: number | null;
}

/** `POST /jobs` : démarre le suivi d'intervention d'une demande attribuée. */
export async function createJob(client: AxiosInstance, requestId: string): Promise<Job> {
  const { data } = await client.post('/jobs', { request_id: requestId });
  return job(data);
}

/** `GET /jobs` : première page des missions du technicien, éventuellement filtrée. */
export async function fetchJobs(client: AxiosInstance, status?: string): Promise<JobsResult> {
  const params = status ? { status } : {};
  const { data } = await client.get('/jobs', { params });
  const page = parseResponse(jobPageSchema, data);
  return { jobs: page.data, total: page.meta?.total ?? null };
}

/** `GET /jobs/{id}`. */
export async function fetchJob(client: AxiosInstance, jobId: string): Promise<Job> {
  const { data } = await client.get(`/jobs/${segment(jobId)}`);
  return job(data);
}

/** `PATCH /jobs/{id}/status` : avancement du suivi (compte rendu à l'achèvement). */
export async function updateJobStatus(
  client: AxiosInstance,
  jobId: string,
  payload: JobStatusPayload,
): Promise<Job> {
  const body: Record<string, string> = { status: payload.status };
  if (payload.completionNotes) body.completion_notes = payload.completionNotes;
  const { data } = await client.patch(`/jobs/${segment(jobId)}/status`, body);
  return job(data);
}

/** `PUT /jobs/{id}/phases` : phases de travail présentées au client. */
export async function updateJobPhases(
  client: AxiosInstance,
  jobId: string,
  phases: JobPhase[],
): Promise<Job> {
  const { data } = await client.put(`/jobs/${segment(jobId)}/phases`, { phases });
  return job(data);
}

/** `GET /jobs/{id}/tracking` : lisible par le client comme par le technicien. */
export async function fetchJobTracking(client: AxiosInstance, jobId: string): Promise<JobTracking> {
  const { data } = await client.get(`/jobs/${segment(jobId)}/tracking`);
  return parseResponse(trackingResponseSchema, data).data;
}

/** `GET /mission/active` : mission en cours du client, ou `null`. */
export async function fetchClientMission(client: AxiosInstance): Promise<ClientMission | null> {
  const { data } = await client.get('/mission/active');
  return parseResponse(clientMissionResponseSchema, data).data;
}

/** `GET /position/technician` : dernière position connue (cache serveur de 5 minutes). */
export async function fetchTechnicianPosition(client: AxiosInstance): Promise<LivePosition | null> {
  const { data } = await client.get('/position/technician');
  return parseResponse(livePositionResponseSchema, data).data;
}

/** `POST /position/update` : partage ponctuel de la position du technicien. */
export async function shareMyPosition(
  client: AxiosInstance,
  coordinates: Coordinates,
): Promise<void> {
  await client.post('/position/update', {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });
}
