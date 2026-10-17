import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  completeIntervention,
  createIntervention,
  fetchIntervention,
  fetchInterventions,
  startIntervention,
} from '../api/interventionsApi';
import type { ReportPayload } from '../schemas/interventionSchemas';
import { interventionsKeys } from './interventionsKeys';

export function useInterventions() {
  const api = useApiClient();
  return useQuery({ queryKey: interventionsKeys.list(), queryFn: () => fetchInterventions(api) });
}

export function useIntervention(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: interventionsKeys.detail(id),
    queryFn: () => fetchIntervention(api, id),
  });
}

export function useCreateIntervention() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { jobId: string; requestId: string; description?: string }) =>
      createIntervention(api, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interventionsKeys.all }),
  });
}

export function useStartIntervention(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startIntervention(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interventionsKeys.all }),
  });
}

export function useCompleteIntervention(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportPayload) => completeIntervention(api, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interventionsKeys.all }),
  });
}
