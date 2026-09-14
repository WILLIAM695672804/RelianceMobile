/** Nature d'une erreur, indépendamment de son origine technique. */
export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthenticated'
  | 'forbidden'
  | 'emailNotVerified'
  | 'twoFactorRequired'
  | 'notFound'
  | 'csrf'
  | 'validation'
  | 'rateLimited'
  | 'server'
  | 'contract'
  | 'unknown';

/** Erreurs de validation par champ, au format Laravel (`errors: { champ: [...] }`). */
export type FieldErrors = Record<string, string[]>;

export interface AppErrorInit {
  kind: AppErrorKind;
  status?: number;
  fieldErrors?: FieldErrors;
  serverMessage?: string;
  cause?: unknown;
}

/** Erreur normalisée manipulée par toute l'application. */
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly fieldErrors: FieldErrors;
  readonly serverMessage?: string;

  constructor({ kind, status, fieldErrors = {}, serverMessage, cause }: AppErrorInit) {
    super(serverMessage ?? kind, { cause });
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.serverMessage = serverMessage;
  }
}

/** Garde de type pour `AppError`. */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
