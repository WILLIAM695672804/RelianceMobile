import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { requestsKeys } from '@/features/requests';

import { fetchTechnicianProfile, findTechnicians, selectTechnician } from '../api/matchingApi';
import type { OfferPayload } from '../schemas/matchingSchemas';
import { matchingKeys } from './matchingKeys';

/**
 * Résultats du rapprochement (E11). `POST /match` est lu comme une requête : il ne crée rien
 * et se borne à marquer la demande « analysée ».
 */
export function useMatchResults(requestId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: matchingKeys.matches(requestId),
    queryFn: () => findTechnicians(api, requestId),
  });
}

/** Profil public d'un technicien (E12). */
export function useTechnicianProfile(technicianId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: matchingKeys.technician(technicianId),
    queryFn: () => fetchTechnicianProfile(api, technicianId),
  });
}

/** Envoi de la proposition au technicien choisi, suivi du rechargement des demandes. */
export function useSelectTechnician(requestId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfferPayload) => selectTechnician(api, requestId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKeys.all }),
  });
}
