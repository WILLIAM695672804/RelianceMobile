import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { AppError, isAppError } from './appError';
import { applyServerErrors } from './applyServerErrors';
import { describeError } from './describeError';
import { normalizeError } from './normalizeError';

function httpError(status: number, data: unknown = {}): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError(
    'Échec de la requête',
    AxiosError.ERR_BAD_RESPONSE,
    config,
    {},
    {
      status,
      statusText: '',
      headers: {},
      config,
      data,
    },
  );
}

function transportError(code: string): AxiosError {
  return new AxiosError('Échec du transport', code);
}

describe('normalizeError', () => {
  it('renvoie telle quelle une AppError', () => {
    const error = new AppError({ kind: 'notFound', status: 404 });
    expect(normalizeError(error)).toBe(error);
  });

  it.each([
    [AxiosError.ERR_NETWORK, 'network'],
    ['ECONNABORTED', 'timeout'],
    ['ETIMEDOUT', 'timeout'],
  ])('traduit l’absence de réponse %s en %s', (code, kind) => {
    expect(normalizeError(transportError(code)).kind).toBe(kind);
  });

  it.each([
    [401, 'unauthenticated'],
    [404, 'notFound'],
    [419, 'csrf'],
    [429, 'rateLimited'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('traduit le statut %i en %s', (status, kind) => {
    const error = normalizeError(httpError(status));
    expect(error.kind).toBe(kind);
    expect(error.status).toBe(status);
  });

  it('conserve le message serveur', () => {
    expect(
      normalizeError(httpError(401, { message: 'Identifiants invalides' })).serverMessage,
    ).toBe('Identifiants invalides');
  });

  it('distingue la 2FA requise (403 + requires_2fa)', () => {
    const error = normalizeError(
      httpError(403, { message: 'Code 2FA requis', requires_2fa: true }),
    );
    expect(error.kind).toBe('twoFactorRequired');
  });

  it('distingue l’e-mail non vérifié avant l’interdiction générique', () => {
    const error = normalizeError(
      httpError(403, { message: 'Your email address is not verified.' }),
    );
    expect(error.kind).toBe('emailNotVerified');
  });

  it('distingue l’e-mail non vérifié signalé par la connexion (requires_email_verification)', () => {
    const error = normalizeError(
      httpError(403, { message: 'Adresse e-mail non vérifiée', requires_email_verification: true }),
    );
    expect(error.kind).toBe('emailNotVerified');
  });

  it('traduit un solde insuffisant (402) en validation portant le message serveur', () => {
    const error = normalizeError(httpError(402, { message: 'Solde insuffisant' }));
    expect(error).toMatchObject({
      kind: 'validation',
      status: 402,
      serverMessage: 'Solde insuffisant',
    });
  });

  it('traduit un autre 403 en forbidden', () => {
    const error = normalizeError(httpError(403, { message: 'Compte désactivé' }));
    expect(error).toMatchObject({ kind: 'forbidden', serverMessage: 'Compte désactivé' });
  });

  it('extrait les erreurs de champ d’une 422 en ignorant les entrées malformées', () => {
    const error = normalizeError(
      httpError(422, {
        message: 'The given data was invalid.',
        errors: { email: ['The email has already been taken.'], role: 'invalide', name: [42] },
      }),
    );
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({ email: ['The email has already been taken.'] });
  });

  it('traduit une 400 métier en validation sans erreur de champ', () => {
    const error = normalizeError(httpError(400, { message: 'Code invalide.' }));
    expect(error).toMatchObject({
      kind: 'validation',
      fieldErrors: {},
      serverMessage: 'Code invalide.',
    });
  });

  it('traduit une ZodError en contract', () => {
    const zodError = z.object({ id: z.string() }).safeParse({}).error;
    expect(normalizeError(zodError).kind).toBe('contract');
  });

  it('traduit toute autre valeur en unknown en conservant la cause', () => {
    const cause = new Error('inattendu');
    const error = normalizeError(cause);
    expect(error.kind).toBe('unknown');
    expect(error.cause).toBe(cause);
    expect(isAppError(error)).toBe(true);
    expect(isAppError(cause)).toBe(false);
  });
});

describe('describeError', () => {
  const t = (key: string) => `[${key}]`;

  it('renvoie la clé i18n du type d’erreur', () => {
    expect(describeError(new AppError({ kind: 'network' }), t)).toBe('[errors:network]');
    expect(
      describeError(new AppError({ kind: 'emailNotVerified', serverMessage: 'Your email…' }), t),
    ).toBe('[errors:emailNotVerified]');
  });

  it('privilégie le message serveur d’une erreur métier sans erreur de champ', () => {
    expect(
      describeError(new AppError({ kind: 'validation', serverMessage: 'Code invalide.' }), t),
    ).toBe('Code invalide.');
  });

  it('renvoie la clé générique pour une validation portant des erreurs de champ', () => {
    const error = new AppError({
      kind: 'validation',
      fieldErrors: { email: ['pris'] },
      serverMessage: 'x',
    });
    expect(describeError(error, t)).toBe('[errors:validation]');
  });
});

describe('applyServerErrors', () => {
  it('reporte le premier message de chaque champ', () => {
    const setError = jest.fn();
    const error = new AppError({
      kind: 'validation',
      fieldErrors: { email: ['pris'], password: ['trop court', 'trop simple'] },
    });

    expect(applyServerErrors(setError, error)).toBe(true);
    expect(setError).toHaveBeenCalledWith('email', { type: 'server', message: 'pris' });
    expect(setError).toHaveBeenCalledWith('password', { type: 'server', message: 'trop court' });
  });

  it('ignore une erreur qui n’est pas une validation', () => {
    const setError = jest.fn();
    expect(applyServerErrors(setError, new AppError({ kind: 'server' }))).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it('renvoie false pour une validation sans erreur de champ', () => {
    expect(applyServerErrors(jest.fn(), new AppError({ kind: 'validation' }))).toBe(false);
  });
});
