import type { AppError } from './appError';

/** Fonction de traduction minimale (compatible avec `i18next.t`). */
export type Translate = (key: string) => string;

/**
 * Message affichable pour une erreur.
 * Une erreur métier sans erreur de champ (400) expose le message du serveur ;
 * sinon, le message générique du type d'erreur est traduit.
 */
export function describeError(error: AppError, t: Translate): string {
  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
  if (error.kind === 'validation' && !hasFieldErrors && error.serverMessage) {
    return error.serverMessage;
  }
  return t(`errors:${error.kind}`);
}
