import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
  type MapRef,
} from '@maplibre/maplibre-react-native';
import { useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Avatar } from './Avatar';
import { Text } from './Text';

/** Style vectoriel OpenFreeMap, identique à celui de la version web (`maplibre-gl`). */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Centre retenu lorsqu'aucune coordonnée n'est connue : Yaoundé. */
export const DEFAULT_CENTER: GeoPoint = { latitude: 3.848, longitude: 11.5021 };

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoPin extends GeoPoint {
  id: string;
  /** Nom de la personne : initiales dans le repère. */
  label: string;
  color?: string;
  onPress?: () => void;
}

export interface GeoMapProps {
  pins?: readonly GeoPin[];
  /** Position de l'utilisateur ou du lieu d'intervention. */
  you?: GeoPoint | null;
  /** Zone d'intervention : cercle de ce rayon autour de `zoneCenter` (ou de `you`). */
  radiusKm?: number | null;
  zoneCenter?: GeoPoint | null;
  /** Aperçu : carte figée, sans gestes ni ornements. */
  compact?: boolean;
  /** Marge intérieure de cadrage, en points (panneaux superposés à la carte). */
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  /** Commandes de zoom pilotées par l'écran (boutons « + » et « − »). */
  ref?: Ref<GeoMapHandle>;
  testID?: string;
}

export interface GeoMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
}

/** Rayon de regroupement, en points d'écran : en deçà, deux repères se chevauchent. */
const CLUSTER_RADIUS_PX = 44;

export interface PinCluster {
  lead: GeoPin;
  members: GeoPin[];
}

/**
 * Regroupe les repères trop proches au zoom courant : un seul repère porte alors le nombre de
 * personnes. Le seuil vaut `CLUSTER_RADIUS_PX` converti en degrés (tuiles de 512 points) ; sans
 * zoom connu, aucun regroupement n'est fait.
 */
export function clusterPins(pins: readonly GeoPin[], zoom: number | null): PinCluster[] {
  if (zoom === null) return pins.map((pin) => ({ lead: pin, members: [pin] }));
  const threshold = (CLUSTER_RADIUS_PX * 360) / (512 * 2 ** zoom);
  const clusters: PinCluster[] = [];
  for (const pin of pins) {
    const scale = Math.cos((pin.latitude * Math.PI) / 180);
    const near = clusters.find(
      ({ lead }) =>
        Math.hypot((lead.longitude - pin.longitude) * scale, lead.latitude - pin.latitude) <
        threshold,
    );
    if (near) near.members.push(pin);
    else clusters.push({ lead: pin, members: [pin] });
  }
  return clusters;
}

const EARTH_KM_PER_DEGREE = 111.32;

/** Polygone approchant un cercle de `radiusKm` autour de `center` (GeoJSON, longitude d'abord). */
export function circlePolygon(center: GeoPoint, radiusKm: number, steps = 48): GeoJSON.Feature {
  const latRadius = radiusKm / EARTH_KM_PER_DEGREE;
  const lngRadius = radiusKm / (EARTH_KM_PER_DEGREE * Math.cos((center.latitude * Math.PI) / 180));
  const ring = Array.from({ length: steps + 1 }, (_, index) => {
    const angle = (2 * Math.PI * index) / steps;
    return [
      center.longitude + lngRadius * Math.cos(angle),
      center.latitude + latRadius * Math.sin(angle),
    ];
  });
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
}

type Bounds = [west: number, south: number, east: number, north: number];

/** Emprise couvrant tous les points (et le cercle de zone), ou `null` pour un point unique. */
export function boundsOf(points: readonly GeoPoint[], margin = 0.004): Bounds | null {
  if (points.length < 2) return null;
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const west = Math.min(...lngs);
  const east = Math.max(...lngs);
  const south = Math.min(...lats);
  const north = Math.max(...lats);
  if (east - west < 1e-6 && north - south < 1e-6) return null;
  return [west - margin, south - margin, east + margin, north + margin];
}

/** Carte géographique réelle (MapLibre, tuiles OpenFreeMap) avec repères de personnes. */
export function GeoMap({
  pins = [],
  you = null,
  radiusKm = null,
  zoneCenter = null,
  compact = false,
  padding,
  ref,
  testID,
}: GeoMapProps) {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  useImperativeHandle(ref, () => {
    const zoomBy = (delta: number) => {
      void mapRef.current
        ?.getZoom()
        .then((zoom) => cameraRef.current?.zoomTo(zoom + delta, { duration: 250 }));
    };
    return { zoomIn: () => zoomBy(1), zoomOut: () => zoomBy(-1) };
  }, []);
  const circleCenter = zoneCenter ?? you;
  const zone = useMemo(
    () => (circleCenter && radiusKm ? circlePolygon(circleCenter, radiusKm) : null),
    [circleCenter, radiusKm],
  );

  const framePoints: GeoPoint[] = [...pins, ...(you ? [you] : [])];
  if (zone && circleCenter && radiusKm) {
    const latRadius = radiusKm / EARTH_KM_PER_DEGREE;
    framePoints.push(
      { latitude: circleCenter.latitude + latRadius, longitude: circleCenter.longitude },
      { latitude: circleCenter.latitude - latRadius, longitude: circleCenter.longitude },
    );
  }
  const bounds = boundsOf(framePoints);
  const center = framePoints[0] ?? DEFAULT_CENTER;
  const viewPadding = {
    top: padding?.top ?? 40,
    bottom: padding?.bottom ?? 40,
    left: padding?.left ?? 40,
    right: padding?.right ?? 40,
  };

  return (
    <View testID={testID} style={{ flex: 1, backgroundColor: theme.colors.surfaceMuted }}>
      <Map
        ref={mapRef}
        onRegionDidChange={(event) => setZoom(event.nativeEvent.zoom)}
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE_URL}
        logo={false}
        compass={!compact}
        attribution={!compact}
        dragPan={!compact}
        touchZoom={!compact}
        doubleTapZoom={!compact}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={
            bounds
              ? { bounds, padding: viewPadding }
              : {
                  center: [center.longitude, center.latitude],
                  zoom: compact ? 11.5 : 12.5,
                  padding: viewPadding,
                }
          }
        />
        {zone ? (
          <GeoJSONSource id="zone" data={zone}>
            <Layer
              id="zone-fill"
              type="fill"
              paint={{ 'fill-color': theme.colors.primary, 'fill-opacity': 0.14 }}
            />
            <Layer
              id="zone-line"
              type="line"
              paint={{ 'line-color': theme.colors.primary, 'line-width': 1.5 }}
            />
          </GeoJSONSource>
        ) : null}
        {/* Marge réservée au badge : le repère natif rogne ce qui déborde de sa vue. */}
        {clusterPins(pins, zoom).map(({ lead, members }) => {
          const count = members.length;
          const openCluster = () => {
            const frame = boundsOf(members);
            if (frame) cameraRef.current?.fitBounds(frame, { padding: viewPadding, duration: 400 });
            else cameraRef.current?.zoomTo((zoom ?? 10) + 3, { duration: 400 });
          };
          return (
            <Marker
              key={lead.id}
              id={lead.id}
              lngLat={[lead.longitude, lead.latitude]}
              anchor="bottom"
              onPress={count > 1 ? openCluster : lead.onPress}
            >
              <View
                accessible
                accessibilityLabel={count > 1 ? `${lead.label} +${count - 1}` : lead.label}
                style={{ paddingTop: count > 1 ? 10 : 0, paddingRight: count > 1 ? 12 : 0 }}
              >
                <View
                  style={{
                    padding: 2,
                    borderRadius: 22,
                    backgroundColor: theme.colors.surface,
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.25)',
                  }}
                >
                  <Avatar name={lead.label} color={lead.color} size={compact ? 28 : 36} />
                </View>
                {count > 1 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      minWidth: 22,
                      height: 22,
                      paddingHorizontal: 5,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: theme.colors.surface,
                      backgroundColor: theme.colors.text,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: theme.colors.background, fontSize: 11 }}
                    >
                      {`+${count - 1}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Marker>
          );
        })}
        {you ? (
          <Marker id="you" lngLat={[you.longitude, you.latitude]} anchor="center">
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: `${theme.colors.primary}55`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
          </Marker>
        ) : null}
      </Map>
    </View>
  );
}
