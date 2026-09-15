import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { AppError } from './appError';

/**
 * Reporte les erreurs de champ d'une réponse 422 dans un formulaire react-hook-form.
 * Les erreurs portent `type: 'server'` : leur message est affiché tel quel, sans traduction.
 * @returns `true` si au moins une erreur a été reportée.
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: AppError,
): boolean {
  if (error.kind !== 'validation') return false;
  let applied = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (message === undefined) continue;
    setError(field as Path<T>, { type: 'server', message });
    applied = true;
  }
  return applied;
}
