import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { useSession } from '@/core/session';

import { fetchMyDocuments, uploadDocument, type KycUploadPayload } from '../api/kycApi';
import { kycKeys } from './kycKeys';

/** Justificatifs de l'utilisateur connecté. */
export function useKycDocuments() {
  const api = useApiClient();
  return useQuery({ queryKey: kycKeys.mine(), queryFn: () => fetchMyDocuments(api) });
}

export function useUploadKycDocument() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: KycUploadPayload) => uploadDocument(api, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kycKeys.all }),
  });
}

/** Relit les justificatifs à chaque décision d'un administrateur (`KycStatusChanged`). */
export function useKycStatusSync() {
  const userId = useSession((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  useChannelEvent(userId ? channels.user(userId) : null, 'KycStatusChanged', () => {
    void queryClient.invalidateQueries({ queryKey: kycKeys.all });
  });
}
