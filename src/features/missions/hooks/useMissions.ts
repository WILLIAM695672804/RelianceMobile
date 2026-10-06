import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { matchingKeys } from '@/features/matching';
import type { Coordinates } from '@/shared/location';

import {
  createJob,
  fetchClientMission,
  fetchJob,
  fetchJobs,
  fetchJobTracking,
  fetchTechnicianPosition,
  shareMyPosition,
  updateJobPhases,
  updateJobStatus,
} from '../api/missionsApi';
import type { JobPhase, JobStatusPayload } from '../schemas/missionSchemas';
import { missionsKeys } from './missionsKeys';

/** Missions du technicien connecté, éventuellement filtrées par statut. */
export function useJobs(status?: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: missionsKeys.list(status),
    queryFn: () => fetchJobs(api, status),
  });
}

export function useJob(jobId: string) {
  const api = useApiClient();
  return useQuery({ queryKey: missionsKeys.detail(jobId), queryFn: () => fetchJob(api, jobId) });
}

/** Suivi d'une mission ; `null` tant qu'aucune mission n'est démarrée. */
export function useJobTracking(jobId: string | null) {
  const api = useApiClient();
  return useQuery({
    queryKey: missionsKeys.tracking(jobId ?? 'none'),
    queryFn: () => fetchJobTracking(api, jobId as string),
    enabled: jobId !== null,
  });
}

export function useClientMission() {
  const api = useApiClient();
  return useQuery({
    queryKey: missionsKeys.clientMission(),
    queryFn: () => fetchClientMission(api),
  });
}

export function useTechnicianPosition() {
  const api = useApiClient();
  return useQuery({
    queryKey: missionsKeys.technicianPosition(),
    queryFn: () => fetchTechnicianPosition(api),
  });
}

/**
 * Toute écriture recharge les missions et la mission acceptée du technicien,
 * dont le champ `job` reflète l'avancement.
 */
function useMissionInvalidation() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: missionsKeys.all });
    await queryClient.invalidateQueries({ queryKey: matchingKeys.all });
  };
}

export function useCreateJob() {
  const api = useApiClient();
  const invalidate = useMissionInvalidation();
  return useMutation({
    mutationFn: (requestId: string) => createJob(api, requestId),
    onSuccess: invalidate,
  });
}

export function useUpdateJobStatus(jobId: string) {
  const api = useApiClient();
  const invalidate = useMissionInvalidation();
  return useMutation({
    mutationFn: (payload: JobStatusPayload) => updateJobStatus(api, jobId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateJobPhases(jobId: string) {
  const api = useApiClient();
  const invalidate = useMissionInvalidation();
  return useMutation({
    mutationFn: (phases: JobPhase[]) => updateJobPhases(api, jobId, phases),
    onSuccess: invalidate,
  });
}

export function useShareMyPosition() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (coordinates: Coordinates) => shareMyPosition(api, coordinates),
  });
}

/**
 * Canaux d'une mission : `jobs.{id}` pour le statut et les phases,
 * `tracking.{id}` pour la position du technicien.
 */
export function useJobSync(jobId: string | null) {
  const queryClient = useQueryClient();
  const jobChannel = jobId ? channels.jobs(jobId) : null;
  const trackingChannel = jobId ? channels.tracking(jobId) : null;
  const invalidate = (queryKey: readonly string[]) => {
    void queryClient.invalidateQueries({ queryKey });
  };

  useChannelEvent(jobChannel, 'JobStatusChanged', () => invalidate(missionsKeys.all));
  useChannelEvent(jobChannel, 'PhasesUpdated', () => invalidate(missionsKeys.all));
  useChannelEvent(trackingChannel, 'TechnicianPositionUpdated', () =>
    invalidate(missionsKeys.technicianPosition()),
  );
}
