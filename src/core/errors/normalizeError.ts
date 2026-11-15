import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import { AppError, isAppError, type FieldErrors } from './appError';

/** Message du middleware Laravel `verified` (EnsureEmailIsVerified). */
const EMAIL_NOT_VERIFIED_MESSAGE = 'Your email address is not verified.';
const TIMEOUT_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function parseFieldErrors(errors: unknown): FieldErrors {
  if (!isRecord(errors)) return {};
  const result: FieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.every((message) => typeof message === 'string')) {
      result[field] = messages;
    }
  }
  return result;
}

/** Convertit toute valeur levée en `AppError`. */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof ZodError) return new AppError({ kind: 'contract', cause: error });
  if (!isAxiosError(error)) return new AppError({ kind: 'unknown', cause: error });

  if (!error.response) {
    const kind = error.code && TIMEOUT_CODES.has(error.code) ? 'timeout' : 'network';
    return new AppError({ kind, cause: error });
  }

  const { status, data } = error.response;
  const body = isRecord(data) ? data : {};
  const serverMessage = typeof body.message === 'string' ? body.message : undefined;
  const base = { status, serverMessage, cause: error };

  switch (status) {
    case 400:
      return new AppError({ ...base, kind: 'validation' });
    case 401:
      return new AppError({ ...base, kind: 'unauthenticated' });
    case 403:
      if (body.requires_2fa === true) return new AppError({ ...base, kind: 'twoFactorRequired' });
      if (
        body.requires_email_verification === true ||
        serverMessage === EMAIL_NOT_VERIFIED_MESSAGE
      ) {
        return new AppError({ ...base, kind: 'emailNotVerified' });
      }
      return new AppError({ ...base, kind: 'forbidden' });
    case 402:
      // Solde insuffisant (paiement de facture, abonnement) : le message du serveur est explicite.
      return new AppError({ ...base, kind: 'validation' });
    case 404:
      return new AppError({ ...base, kind: 'notFound' });
    case 419:
      return new AppError({ ...base, kind: 'csrf' });
    case 422:
      return new AppError({
        ...base,
        kind: 'validation',
        fieldErrors: parseFieldErrors(body.errors),
      });
    case 429:
      return new AppError({ ...base, kind: 'rateLimited' });
    default:
      return new AppError({ ...base, kind: status >= 500 ? 'server' : 'unknown' });
  }
}
