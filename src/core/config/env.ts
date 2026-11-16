import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(['development', 'staging', 'production']),
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_WS_HOST: z.string().min(1),
  EXPO_PUBLIC_WS_PORT: z.coerce.number().int().positive(),
  EXPO_PUBLIC_WS_KEY: z.string().min(1),
  EXPO_PUBLIC_STATEFUL_ORIGIN: z.url(),
  EXPO_PUBLIC_WEB_URL: z.url().optional(),
});

/** Variables brutes, telles que lues dans `process.env`. */
export type EnvSource = Record<
  Exclude<keyof z.input<typeof envSchema>, 'EXPO_PUBLIC_WEB_URL'>,
  string | undefined
> & { EXPO_PUBLIC_WEB_URL?: string | undefined };

/** Configuration validée de l'application. */
export interface AppEnv {
  env: 'development' | 'staging' | 'production';
  /** Racine du backend, sans `/api/v1` ni barre oblique finale. */
  apiUrl: string;
  wsHost: string;
  wsPort: number;
  wsKey: string;
  /** Origine envoyée dans `Origin`/`Referer` ; doit figurer dans `SANCTUM_STATEFUL_DOMAINS`. */
  statefulOrigin: string;
  /** Application web (inscription, fonctions réservées au web) ; absente si non configurée. */
  webUrl: string | null;
}

/** Configuration invalide : le lancement de l'application est interrompu. */
export class InvalidEnvError extends Error {
  constructor(readonly issues: string[]) {
    super(`Configuration invalide :\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'InvalidEnvError';
  }
}

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

/**
 * Valide et normalise les variables `EXPO_PUBLIC_*`.
 * @throws {InvalidEnvError} en énumérant chaque variable invalide.
 */
export function parseEnv(source: EnvSource): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new InvalidEnvError(
      result.error.issues.map((issue) => `${issue.path.join('.')} : ${issue.message}`),
    );
  }
  const data = result.data;
  return {
    env: data.EXPO_PUBLIC_ENV,
    apiUrl: stripTrailingSlash(data.EXPO_PUBLIC_API_URL),
    wsHost: data.EXPO_PUBLIC_WS_HOST,
    wsPort: data.EXPO_PUBLIC_WS_PORT,
    wsKey: data.EXPO_PUBLIC_WS_KEY,
    statefulOrigin: stripTrailingSlash(data.EXPO_PUBLIC_STATEFUL_ORIGIN),
    webUrl: data.EXPO_PUBLIC_WEB_URL ? stripTrailingSlash(data.EXPO_PUBLIC_WEB_URL) : null,
  };
}
