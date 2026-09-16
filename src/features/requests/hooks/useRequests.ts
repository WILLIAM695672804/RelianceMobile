import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { createRequest, fetchRequest, fetchRequests } from '../api/requestsApi';
import type { CreateRequestPayload } from '../schemas/requestSchemas';
import { requestsKeys } from './requestsKeys';

/** Demandes du client connecté. */
export function useRequests() {
  const api = useApiClient();
  return useQuery({ queryKey: requestsKeys.list(), queryFn: () => fetchRequests(api) });
}

/** Une demande du client connecté. */
export function useRequest(id: string) {
  const api = useApiClient();
  return useQuery({ queryKey: requestsKeys.detail(id), queryFn: () => fetchRequest(api, id) });
}

/** Création d'une demande, suivie du rechargement des demandes. */
export function useCreateRequest() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => createRequest(api, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKeys.all }),
  });
}
