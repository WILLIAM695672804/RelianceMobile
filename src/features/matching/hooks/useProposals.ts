import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { useSession } from '@/core/session';
import { requestsKeys } from '@/features/requests';

import {
  acceptProposal,
  fetchActiveMission,
  fetchReceivedProposals,
  refuseProposal,
} from '../api/matchingApi';
import { matchingKeys } from './matchingKeys';

/** Propositions reçues par le technicien connecté. */
export function useReceivedProposals() {
  const api = useApiClient();
  return useQuery({
    queryKey: matchingKeys.proposals(),
    queryFn: () => fetchReceivedProposals(api),
  });
}

/** Mission acceptée en cours du technicien connecté (`null` si aucune). */
export function useActiveMission() {
  const api = useApiClient();
  return useQuery({
    queryKey: matchingKeys.activeMission(),
    queryFn: () => fetchActiveMission(api),
  });
}

/** Décision sur une proposition, suivie du rechargement des propositions et de la mission. */
function useProposalDecision(
  decide: (client: AxiosInstance, proposalId: string) => Promise<string>,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: string) => decide(api, proposalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: matchingKeys.all }),
  });
}

export const useAcceptProposal = () => useProposalDecision(acceptProposal);
export const useRefuseProposal = () => useProposalDecision(refuseProposal);

/**
 * Canal `proposals.{id}` : une proposition reçue recharge les propositions du technicien ;
 * une acceptation ou un refus recharge les demandes du client.
 */
export function useProposalsSync() {
  const userId = useSession((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  const channel = userId ? channels.proposals(userId) : null;
  const invalidate = (queryKey: readonly string[]) => {
    void queryClient.invalidateQueries({ queryKey });
  };

  useChannelEvent(channel, 'ProposalCreated', () => invalidate(matchingKeys.all));
  useChannelEvent(channel, 'ProposalAccepted', () => invalidate(requestsKeys.all));
  useChannelEvent(channel, 'ProposalRefused', () => invalidate(requestsKeys.all));
}
