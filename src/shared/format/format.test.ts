import {
  formatAmount,
  formatClockTime,
  formatDate,
  formatDistance,
  formatHours,
  formatRating,
} from './format';

const NBSP = ' ';

describe('formats', () => {
  it('formatAmount groupe les milliers et arrondit au franc', () => {
    expect(formatAmount(15000)).toBe(`15${NBSP}000${NBSP}FCFA`);
    expect(formatAmount(1234567.6)).toBe(`1${NBSP}234${NBSP}568${NBSP}FCFA`);
    expect(formatAmount(500)).toBe(`500${NBSP}FCFA`);
  });

  it('formatDistance exprime les courtes distances en mètres', () => {
    expect(formatDistance(0.25)).toBe(`250${NBSP}m`);
    expect(formatDistance(2.54)).toBe(`2,5${NBSP}km`);
    expect(formatDistance(12)).toBe(`12${NBSP}km`);
  });

  it('formatRating affiche une décimale avec la virgule', () => {
    expect(formatRating(4.8)).toBe('4,8');
    expect(formatRating(5)).toBe('5,0');
  });

  it('formatDate produit une date jour/mois/année', () => {
    expect(formatDate('2026-09-16T12:00:00+00:00')).toBe('16/09/2026');
    expect(formatDate('date invalide')).toBe('');
  });
});

describe('formatClockTime', () => {
  it('rend l’heure locale sur deux chiffres', () => {
    expect(formatClockTime(new Date(2026, 9, 6, 9, 5).toISOString())).toBe('09:05');
  });

  it('rend une chaîne vide pour une date absente ou illisible', () => {
    expect(formatClockTime(null)).toBe('');
    expect(formatClockTime('illisible')).toBe('');
  });
});

describe('formatHours', () => {
  it('sépare la décimale par une virgule', () => {
    expect(formatHours(1.5)).toBe(`1,5${NBSP}h`);
  });

  it('omet la décimale nulle', () => {
    expect(formatHours(2)).toBe(`2${NBSP}h`);
  });

  it('arrondit au dixième', () => {
    expect(formatHours(1.26)).toBe(`1,3${NBSP}h`);
  });
});
