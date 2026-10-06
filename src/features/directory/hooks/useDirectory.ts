import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { searchTechnicians } from '../api/directoryApi';
import type { TechnicianFilters } from '../schemas/directorySchemas';
import { directoryKeys } from './directoryKeys';

/** Annuaire public filtré ; la réponse précédente reste affichée pendant une nouvelle recherche. */
export function useTechnicianDirectory(filters: TechnicianFilters) {
  const api = useApiClient();
  return useQuery({
    queryKey: directoryKeys.search(filters),
    queryFn: () => searchTechnicians(api, filters),
  });
}
