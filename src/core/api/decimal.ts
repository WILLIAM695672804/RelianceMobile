import { z } from 'zod';

/**
 * Valeur décimale : Laravel sérialise les colonnes `decimal` en chaînes (« 15000.00 »)
 * et les valeurs calculées en nombres. Les deux formes deviennent un `number` fini.
 */
export const decimalSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .transform((value, context) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      context.addIssue({ code: 'custom', message: 'Valeur décimale attendue' });
      return z.NEVER;
    }
    return parsed;
  });
