import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { fetchSkillCatalog } from '../api/skillsApi';
import { profileKeys } from './profileKeys';

/** Le catalogue évolue rarement : une heure de fraîcheur. */
const SKILL_CATALOG_STALE_TIME = 60 * 60 * 1000;

/** Catalogue public des compétences (catégories des demandes, compétences du technicien). */
export function useSkillCatalog() {
  const api = useApiClient();
  return useQuery({
    queryKey: profileKeys.skills(),
    queryFn: () => fetchSkillCatalog(api),
    staleTime: SKILL_CATALOG_STALE_TIME,
  });
}
