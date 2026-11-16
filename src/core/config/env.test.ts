import { InvalidEnvError, parseEnv, type EnvSource } from './env';

const validSource: EnvSource = {
  EXPO_PUBLIC_ENV: 'development',
  EXPO_PUBLIC_API_URL: 'http://10.0.2.2:8000/',
  EXPO_PUBLIC_WS_HOST: '10.0.2.2',
  EXPO_PUBLIC_WS_PORT: '6001',
  EXPO_PUBLIC_WS_KEY: 'reliance-key',
  EXPO_PUBLIC_STATEFUL_ORIGIN: 'http://mobile.reliance.local/',
};

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  throw new Error("L'action aurait dû lever une erreur.");
}

describe('parseEnv', () => {
  it('produit une configuration typée, sans barre oblique finale', () => {
    expect(parseEnv(validSource)).toEqual({
      env: 'development',
      apiUrl: 'http://10.0.2.2:8000',
      wsHost: '10.0.2.2',
      wsPort: 6001,
      wsKey: 'reliance-key',
      statefulOrigin: 'http://mobile.reliance.local',
      webUrl: null,
    });
  });

  it('normalise l’adresse web facultative', () => {
    expect(parseEnv({ ...validSource, EXPO_PUBLIC_WEB_URL: 'http://localhost:5173/' }).webUrl).toBe(
      'http://localhost:5173',
    );
  });

  it('rejette un environnement inconnu', () => {
    expect(() => parseEnv({ ...validSource, EXPO_PUBLIC_ENV: 'recette' })).toThrow(InvalidEnvError);
  });

  it('rejette un port non numérique ou nul', () => {
    expect(() => parseEnv({ ...validSource, EXPO_PUBLIC_WS_PORT: 'abc' })).toThrow(InvalidEnvError);
    expect(() => parseEnv({ ...validSource, EXPO_PUBLIC_WS_PORT: '0' })).toThrow(InvalidEnvError);
  });

  it('énumère chaque variable invalide dans le message', () => {
    const error = captureError(() =>
      parseEnv({ ...validSource, EXPO_PUBLIC_API_URL: undefined, EXPO_PUBLIC_WS_KEY: '' }),
    );

    expect(error).toBeInstanceOf(InvalidEnvError);
    const envError = error as InvalidEnvError;
    expect(envError.issues).toHaveLength(2);
    expect(envError.message).toContain('EXPO_PUBLIC_API_URL');
    expect(envError.message).toContain('EXPO_PUBLIC_WS_KEY');
  });
});
