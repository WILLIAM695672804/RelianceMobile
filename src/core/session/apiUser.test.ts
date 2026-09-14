import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { apiUserSchema, fetchCurrentUser, toSessionUser } from './apiUser';

const rawUser = {
  id: '9d1c6f7e-0000-4000-8000-000000000001',
  name: 'Technicien Test',
  email: 'technicien@example.test',
  phone: null,
  avatar_url: null,
  email_verified_at: '2026-01-10T08:00:00.000000Z',
  is_active: true,
  verified: true,
  two_factor_enabled: false,
  two_factor_secret: 'NE-DOIT-PAS-ETRE-CONSERVE',
  two_factor_recovery_codes: null,
  rating: '4.50',
  meta: { bio: 'Électricien' },
  roles: [{ id: 3, name: 'technicien', guard_name: 'web' }],
};

describe('apiUserSchema', () => {
  it('écarte les champs non déclarés, dont les secrets 2FA', () => {
    const parsed = apiUserSchema.parse(rawUser);
    expect(parsed).not.toHaveProperty('two_factor_secret');
    expect(parsed).not.toHaveProperty('two_factor_recovery_codes');
    expect(parsed.roles).toEqual([{ name: 'technicien' }]);
  });

  it('tolère l’absence des rôles', () => {
    expect(apiUserSchema.parse({ ...rawUser, roles: undefined }).roles).toEqual([]);
  });
});

describe('toSessionUser', () => {
  it('produit le profil minimal de session', () => {
    expect(toSessionUser(apiUserSchema.parse(rawUser))).toEqual({
      id: rawUser.id,
      name: 'Technicien Test',
      email: 'technicien@example.test',
      role: 'technicien',
      emailVerified: true,
      avatarUrl: null,
    });
  });

  it('marque un e-mail non vérifié et un rôle absent', () => {
    const user = toSessionUser(
      apiUserSchema.parse({ ...rawUser, email_verified_at: null, roles: [] }),
    );
    expect(user.emailVerified).toBe(false);
    expect(user.role).toBe('unknown');
  });
});

describe('fetchCurrentUser', () => {
  it('lit /auth/me et renvoie le profil de session', async () => {
    const client = axios.create();
    new MockAdapter(client).onGet('/auth/me').reply(200, { user: rawUser });

    await expect(fetchCurrentUser(client)).resolves.toMatchObject({ role: 'technicien' });
  });

  it('lève une AppError contract si la réponse est non conforme', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const client = axios.create();
    new MockAdapter(client).onGet('/auth/me').reply(200, { user: { id: 1 } });

    await expect(fetchCurrentUser(client)).rejects.toMatchObject({ kind: 'contract' });
    jest.restoreAllMocks();
  });
});
