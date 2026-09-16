import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import { skillCatalogResponseSchema, type Skill } from '../schemas/skillSchemas';

/** `GET /skills` : catalogue public des compétences. */
export async function fetchSkillCatalog(client: AxiosInstance): Promise<Skill[]> {
  const { data } = await client.get('/skills');
  return parseResponse(skillCatalogResponseSchema, data).data;
}
