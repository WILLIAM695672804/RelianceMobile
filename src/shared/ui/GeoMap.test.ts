import { boundsOf, circlePolygon } from './GeoMap';

describe('GeoMap', () => {
  it('trace un cercle fermé du rayon demandé', () => {
    const feature = circlePolygon({ latitude: 0, longitude: 10 }, 111.32, 4);
    const ring = (feature.geometry as GeoJSON.Polygon).coordinates[0]!;
    expect(ring).toHaveLength(5);
    expect(ring[0]![0]).toBeCloseTo(11);
    expect(ring[1]![1]).toBeCloseTo(1);
    expect(ring[4]![0]).toBeCloseTo(ring[0]![0]!);
    expect(ring[4]![1]).toBeCloseTo(ring[0]![1]!);
  });

  it('encadre plusieurs points, pas un point isolé', () => {
    expect(boundsOf([{ latitude: 3.8, longitude: 11.5 }])).toBeNull();
    expect(
      boundsOf(
        [
          { latitude: 3.8, longitude: 11.5 },
          { latitude: 3.9, longitude: 11.6 },
        ],
        0,
      ),
    ).toEqual([11.5, 3.8, 11.6, 3.9]);
  });
});
