import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  normalizeFilters,
  technicianPageSchema,
  type TechnicianCard,
  type TechnicianFilters,
} from '../schemas/directorySchemas';

export interface DirectoryResult {
  technicians: TechnicianCard[];
  /** Nombre total de techniciens correspondant aux filtres, si le serveur le fournit. */
  total: number | null;
}

/** `GET /technicians` : première page des techniciens vérifiés et actifs. */
export async function searchTechnicians(
  client: AxiosInstance,
  filters: TechnicianFilters,
): Promise<DirectoryResult> {
  const normalized = normalizeFilters(filters);
  const params: Record<string, string | number> = {};
  if (normalized.search) params.search = normalized.search;
  if (normalized.skill) params.skill = normalized.skill;
  if (normalized.latitude != null && normalized.longitude != null) {
    params.latitude = normalized.latitude;
    params.longitude = normalized.longitude;
    if (normalized.radiusKm != null) params.radius_km = normalized.radiusKm;
  }
  const { data } = await client.get('/technicians', { params });
  const page = parseResponse(technicianPageSchema, data);
  return { technicians: page.data, total: page.meta?.total ?? null };
}
