import { decimalSchema } from './decimal';

describe('decimalSchema', () => {
  it('convertit les chaînes décimales sérialisées par Laravel', () => {
    expect(decimalSchema.parse('15000.00')).toBe(15000);
  });

  it('accepte les nombres', () => {
    expect(decimalSchema.parse(4.8)).toBe(4.8);
  });

  it('rejette une chaîne non numérique ou vide', () => {
    expect(decimalSchema.safeParse('abc').success).toBe(false);
    expect(decimalSchema.safeParse('').success).toBe(false);
  });
});
