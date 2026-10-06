import { normalizeFilters, type TechnicianFilters } from '../schemas/directorySchemas';

/** Clés de cache de la feature `directory`. */
export const directoryKeys = {
  all: ['directory'] as const,
  search: (filters: TechnicianFilters) =>
    [...directoryKeys.all, 'search', normalizeFilters(filters)] as const,
};
