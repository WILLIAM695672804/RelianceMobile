import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  addAgencyMember,
  createAgency,
  fetchAgency,
  fetchAgencyMembers,
  fetchMyAgency,
  removeAgencyMember,
  updateAgency,
} from '../api/agencyApi';
import type { AgencyPayload, MemberPayload } from '../schemas/agencySchemas';
import { agencyKeys } from './agencyKeys';

export function useMyAgency() {
  const api = useApiClient();
  return useQuery({ queryKey: agencyKeys.mine(), queryFn: () => fetchMyAgency(api) });
}

export function useAgency(agencyId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: agencyKeys.detail(agencyId),
    queryFn: () => fetchAgency(api, agencyId),
  });
}

export function useAgencyMembers(agencyId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: agencyKeys.members(agencyId),
    queryFn: () => fetchAgencyMembers(api, agencyId),
  });
}

/** Toute écriture recharge l'agence et son équipe. */
function useAgencyInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: agencyKeys.all });
}

export function useCreateAgency() {
  const api = useApiClient();
  const invalidate = useAgencyInvalidation();
  return useMutation({
    mutationFn: (payload: AgencyPayload) => createAgency(api, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAgency(agencyId: string) {
  const api = useApiClient();
  const invalidate = useAgencyInvalidation();
  return useMutation({
    mutationFn: (payload: AgencyPayload) => updateAgency(api, agencyId, payload),
    onSuccess: invalidate,
  });
}

export function useAddAgencyMember(agencyId: string) {
  const api = useApiClient();
  const invalidate = useAgencyInvalidation();
  return useMutation({
    mutationFn: (payload: MemberPayload) => addAgencyMember(api, agencyId, payload),
    onSuccess: invalidate,
  });
}

export function useRemoveAgencyMember(agencyId: string) {
  const api = useApiClient();
  const invalidate = useAgencyInvalidation();
  return useMutation({
    mutationFn: (userId: string) => removeAgencyMember(api, agencyId, userId),
    onSuccess: invalidate,
  });
}
