import type { z } from 'zod';

import { AppError } from '@/core/errors';

/**
 * Valide une réponse d'API par son schéma Zod.
 * @throws {AppError} de type `contract` si la réponse s'écarte du schéma (écart journalisé en développement).
 */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (__DEV__) {
    console.warn('[contrat API] réponse non conforme', result.error.issues);
  }
  throw new AppError({ kind: 'contract', cause: result.error });
}
