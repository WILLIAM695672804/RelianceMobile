import { computeGuards } from './guards';
import type { Role, SessionState } from './types';

const userWith = (role: Role) => ({
  id: 'u1',
  name: 'Test',
  email: 't@example.test',
  role,
  emailVerified: true,
  avatarUrl: null,
});

const state = (overrides: Partial<SessionState>): SessionState => ({
  status: 'unknown',
  user: null,
  expired: false,
  ...overrides,
});

describe('computeGuards', () => {
  it('n’ouvre que le démarrage tant que la session est inconnue', () => {
    expect(computeGuards(state({}))).toEqual({
      isBooting: true,
      isGuest: false,
      isClient: false,
      isTechnicien: false,
      isAgence: false,
      isWebOnly: false,
    });
  });

  it('ouvre le groupe invité sans session', () => {
    expect(computeGuards(state({ status: 'unauthenticated' }))).toMatchObject({
      isBooting: false,
      isGuest: true,
    });
  });

  it.each([
    ['client', 'isClient'],
    ['technicien', 'isTechnicien'],
    ['agence', 'isAgence'],
    ['admin', 'isWebOnly'],
    ['unknown', 'isWebOnly'],
  ] as const)('ouvre l’espace du rôle %s', (role, guard) => {
    const guards = computeGuards(state({ status: 'authenticated', user: userWith(role) }));
    expect(guards[guard]).toBe(true);
    expect(Object.values(guards).filter(Boolean)).toHaveLength(1);
  });

  it('ouvre l’espace du rôle en mode dégradé', () => {
    expect(
      computeGuards(state({ status: 'degraded', user: userWith('technicien') })).isTechnicien,
    ).toBe(true);
  });
});
