import { parseEnv, type AppEnv } from './env';

export { InvalidEnvError, parseEnv, type AppEnv, type EnvSource } from './env';

/** Configuration de l'application, validée au chargement du module. */
export const appEnv: AppEnv = parseEnv({
  EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_WS_HOST: process.env.EXPO_PUBLIC_WS_HOST,
  EXPO_PUBLIC_WS_PORT: process.env.EXPO_PUBLIC_WS_PORT,
  EXPO_PUBLIC_WS_KEY: process.env.EXPO_PUBLIC_WS_KEY,
  EXPO_PUBLIC_STATEFUL_ORIGIN: process.env.EXPO_PUBLIC_STATEFUL_ORIGIN,
  EXPO_PUBLIC_WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
});
