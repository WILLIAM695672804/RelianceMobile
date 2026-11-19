import { boundsOf, circlePolygon, clusterPins } from './GeoMap';

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

describe('clusterPins', () => {
  const pin = (id: string, latitude: number, longitude: number) => ({
    id,
    label: id,
    latitude,
    longitude,
  });
  const yaounde = [pin('a', 3.848, 11.5021), pin('b', 3.84, 11.49), pin('c', 3.86, 11.52)];
  const douala = pin('d', 4.0511, 9.7679);

  it('regroupe les repères voisins à l’échelle régionale', () => {
    const clusters = clusterPins([...yaounde, douala], 7);
    expect(clusters.map((cluster) => cluster.members.length)).toEqual([3, 1]);
  });

  it('les sépare une fois la carte rapprochée', () => {
    expect(clusterPins(yaounde, 15)).toHaveLength(3);
  });

  it('ne regroupe rien tant que le zoom est inconnu', () => {
    expect(clusterPins(yaounde, null)).toHaveLength(3);
  });
});
