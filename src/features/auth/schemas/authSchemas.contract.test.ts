import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { normalizeError } from '@/core/errors';
import { apiUserSchema, toSessionUser } from '@/core/session';
import login2faRequired from '@/test/fixtures/auth/login-2fa-required.json';
import loginInvalid from '@/test/fixtures/auth/login-invalid.json';
import loginSuccess from '@/test/fixtures/auth/login-success.json';
import logout from '@/test/fixtures/auth/logout.json';
import me from '@/test/fixtures/auth/me.json';
import registerValidationError from '@/test/fixtures/auth/register-validation-error.json';

import { loginResponseSchema, messageResponseSchema } from './authSchemas';

function httpError(status: number, data: unknown): AxiosError {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return new AxiosError(
    'échec',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    response as AxiosResponse,
  );
}

describe('contrat des réponses d’authentification', () => {
  it('POST /auth/login 200 : utilisateur technicien, secrets écartés', () => {
    const parsed = loginResponseSchema.parse(loginSuccess);

    expect(parsed.message).toBe('Connexion réussie');
    expect(toSessionUser(parsed.user).role).toBe('technicien');
    expect(parsed.user).not.toHaveProperty('two_factor_secret');
  });

  it('GET /auth/me 200 : utilisateur conforme', () => {
    expect(() => apiUserSchema.parse(me.user)).not.toThrow();
  });

  it('POST /auth/logout 200 et POST /auth/login 401 : message', () => {
    expect(messageResponseSchema.parse(logout).message).toBe('Déconnexion réussie');
    expect(messageResponseSchema.parse(loginInvalid).message).toBe('Identifiants invalides');
  });

  it('POST /auth/register 422 : erreurs de champ exploitables', () => {
    const error = normalizeError(httpError(422, registerValidationError));

    expect(error.kind).toBe('validation');
    expect(Object.keys(error.fieldErrors)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });

  it('POST /auth/login 403 requires_2fa : étape 2FA', () => {
    expect(normalizeError(httpError(403, login2faRequired)).kind).toBe('twoFactorRequired');
  });
});
