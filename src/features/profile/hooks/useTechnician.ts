import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  addTechnicianSkill,
  fetchMyTechnicianSkills,
  fetchTechnicianIdentity,
  fetchTechnicianStats,
  removeTechnicianSkill,
  updateServiceArea,
  updateTechnicianProfile,
} from '../api/technicianApi';
import type {
  ServiceAreaPayload,
  TechnicianProfilePayload,
  TechnicianSkillPayload,
} from '../schemas/technicianSchemas';
import { profileKeys } from './profileKeys';

/** Profil professionnel du technicien connecté. */
export function useTechnicianIdentity() {
  const api = useApiClient();
  return useQuery({
    queryKey: profileKeys.technicianIdentity(),
    queryFn: () => fetchTechnicianIdentity(api),
  });
}

/** Compétences tarifées du technicien connecté. */
export function useMyTechnicianSkills() {
  const api = useApiClient();
  return useQuery({
    queryKey: profileKeys.technicianSkills(),
    queryFn: () => fetchMyTechnicianSkills(api),
  });
}

/** Statistiques d'activité du technicien connecté. */
export function useTechnicianStats() {
  const api = useApiClient();
  return useQuery({
    queryKey: profileKeys.technicianStats(),
    queryFn: () => fetchTechnicianStats(api),
  });
}

/** Toute écriture du volet technicien recharge profil, compétences et statistiques. */
function useTechnicianInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: profileKeys.technician() });
}

export function useUpdateTechnicianProfile() {
  const api = useApiClient();
  const invalidate = useTechnicianInvalidation();
  return useMutation({
    mutationFn: (payload: TechnicianProfilePayload) => updateTechnicianProfile(api, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateServiceArea() {
  const api = useApiClient();
  const invalidate = useTechnicianInvalidation();
  return useMutation({
    mutationFn: (payload: ServiceAreaPayload) => updateServiceArea(api, payload),
    onSuccess: invalidate,
  });
}

export function useAddTechnicianSkill() {
  const api = useApiClient();
  const invalidate = useTechnicianInvalidation();
  return useMutation({
    mutationFn: (payload: TechnicianSkillPayload) => addTechnicianSkill(api, payload),
    onSuccess: invalidate,
  });
}

export function useRemoveTechnicianSkill() {
  const api = useApiClient();
  const invalidate = useTechnicianInvalidation();
  return useMutation({
    mutationFn: (skillId: string) => removeTechnicianSkill(api, skillId),
    onSuccess: invalidate,
  });
}
