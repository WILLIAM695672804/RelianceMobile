import { distanceBetween } from './geo';

describe('distanceBetween', () => {
  it('mesure une distance nulle entre deux points identiques', () => {
    expect(
      distanceBetween(
        { latitude: 3.848, longitude: 11.5021 },
        { latitude: 3.848, longitude: 11.5021 },
      ),
    ).toBe(0);
  });

  it('mesure la distance à vol d’oiseau en kilomètres', () => {
    const distance = distanceBetween(
      { latitude: 3.848, longitude: 11.5021 },
      { latitude: 3.852, longitude: 11.503 },
    );

    expect(distance).toBeGreaterThan(0.4);
    expect(distance).toBeLessThan(0.6);
  });

  it('mesure une distance connue (Yaoundé – Douala, environ 200 km)', () => {
    const distance = distanceBetween(
      { latitude: 3.848, longitude: 11.5021 },
      { latitude: 4.0511, longitude: 9.7679 },
    );

    expect(Math.round(distance)).toBeGreaterThan(190);
    expect(Math.round(distance)).toBeLessThan(210);
  });
});
