import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { fetchDispute, fetchDisputes, openDispute, postDisputeMessage } from '../api/disputesApi';
import type { DisputePayload } from '../schemas/disputeSchemas';
import { disputesKeys } from './disputesKeys';

export function useDisputes() {
  const api = useApiClient();
  return useQuery({ queryKey: disputesKeys.list(), queryFn: () => fetchDisputes(api) });
}

export function useDispute(id: string) {
  const api = useApiClient();
  return useQuery({ queryKey: disputesKeys.detail(id), queryFn: () => fetchDispute(api, id) });
}

export function useOpenDispute() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DisputePayload) => openDispute(api, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disputesKeys.all }),
  });
}

export function usePostDisputeMessage(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => postDisputeMessage(api, id, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disputesKeys.detail(id) }),
  });
}
