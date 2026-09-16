import { z } from 'zod';

/** Compétence du catalogue public (`GET /skills`). */
export const skillSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string().nullish(),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillCatalogResponseSchema = z.object({ data: z.array(skillSchema) });
