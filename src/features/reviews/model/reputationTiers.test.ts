import { nextTierPoints, tierFor, tierProgress } from './reputationTiers';

describe('tierFor', () => {
  it('place un débutant en bronze', () => {
    expect(tierFor(0)).toBe('bronze');
    expect(tierFor(-10)).toBe('bronze');
  });

  it('respecte les seuils des maquettes', () => {
    expect(tierFor(49)).toBe('bronze');
    expect(tierFor(50)).toBe('silver');
    expect(tierFor(150)).toBe('gold');
    expect(tierFor(300)).toBe('platinum');
    expect(tierFor(600)).toBe('diamond');
    expect(tierFor(10000)).toBe('diamond');
  });
});

describe('nextTierPoints', () => {
  it('indique le seuil suivant', () => {
    expect(nextTierPoints(0)).toBe(50);
    expect(nextTierPoints(187)).toBe(300);
  });

  it('ne promet rien au palier maximal', () => {
    expect(nextTierPoints(600)).toBeNull();
  });
});

describe('tierProgress', () => {
  it('mesure l’avancement dans le palier', () => {
    expect(tierProgress(150)).toBe(0);
    expect(tierProgress(225)).toBe(0.5);
  });

  it('est complet au palier maximal', () => {
    expect(tierProgress(600)).toBe(1);
  });

  it('reste borné', () => {
    expect(tierProgress(-50)).toBe(0);
  });
});
