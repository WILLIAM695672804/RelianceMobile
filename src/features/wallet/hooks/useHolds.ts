import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { captureHold, fetchHolds, placeHold, releaseHold } from '../api/holdsApi';
import type { CapturePayload } from '../schemas/holdSchemas';
import { walletKeys } from './walletKeys';

export function useHolds() {
  const api = useApiClient();
  return useQuery({ queryKey: walletKeys.holds(), queryFn: () => fetchHolds(api) });
}

export function usePlaceHold() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; reason: string }) => placeHold(api, input),
    // Le solde disponible change avec le gel : tout le portefeuille est rechargé.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}

export function useCaptureHold(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CapturePayload) => captureHold(api, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}

export function useReleaseHold(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => releaseHold(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}
