import { resolveRole } from './roles';

describe('resolveRole', () => {
  it.each([
    [['client'], 'client'],
    [['technicien'], 'technicien'],
    [['agence'], 'agence'],
    [['admin'], 'admin'],
    [['client', 'technicien'], 'technicien'],
    [['technicien', 'agence'], 'agence'],
    [['client', 'admin'], 'admin'],
    [['superviseur'], 'unknown'],
    [[], 'unknown'],
  ])('résout %j en %s', (names, expected) => {
    expect(resolveRole(names)).toBe(expected);
  });
});
