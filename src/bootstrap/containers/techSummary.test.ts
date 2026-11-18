import { spreadOverlaps } from './techSummary';

describe('spreadOverlaps', () => {
  it('laisse intacts les repères distincts', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 60, y: 40 },
    ];
    expect(spreadOverlaps(points)).toEqual(points);
  });

  it('écarte les repères confondus pour qu’ils restent tous visibles', () => {
    const spread = spreadOverlaps(Array.from({ length: 5 }, () => ({ x: 50, y: 50 })));
    const keys = new Set(spread.map((point) => `${Math.round(point.x)}:${Math.round(point.y)}`));
    expect(keys.size).toBe(5);
    for (const point of spread) {
      expect(Math.hypot(point.x - 50, point.y - 50)).toBeCloseTo(9);
    }
  });
});
