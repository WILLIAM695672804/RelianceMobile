import * as Location from 'expo-location';
import { Linking } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Lieu retenu pour une intervention. */
export interface Place extends Coordinates {
  /** Adresse lisible, si elle est connue. */
  label: string | null;
  city: string | null;
}

export type LocateResult =
  { status: 'located'; place: Place } | { status: 'denied' } | { status: 'unavailable' };

type GeocodedAddress = Partial<
  Pick<Location.LocationGeocodedAddress, 'street' | 'name' | 'city' | 'formattedAddress'>
>;

function describeAddress(address: GeocodedAddress | undefined): string | null {
  if (!address) return null;
  if (address.formattedAddress) return address.formattedAddress;
  const parts = [address.street ?? address.name, address.city].filter((part): part is string =>
    Boolean(part),
  );
  return parts.length > 0 ? parts.join(', ') : null;
}

/** Position courante de l'appareil, après sollicitation de l'autorisation « pendant l'utilisation ». */
export async function locateDevice(): Promise<LocateResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const [address] = await Location.reverseGeocodeAsync(coordinates).catch(
      (): GeocodedAddress[] => [],
    );
    return {
      status: 'located',
      place: { ...coordinates, label: describeAddress(address), city: address?.city ?? null },
    };
  } catch {
    return { status: 'unavailable' };
  }
}

/**
 * Coordonnées d'une adresse saisie ; `null` si elle est vide, introuvable ou si le géocodeur échoue.
 * L'autorisation est sollicitée au préalable (exigée par le géocodeur Android), sans être bloquante.
 */
export async function geocodeAddress(query: string): Promise<Place | null> {
  const address = query.trim();
  if (!address) return null;
  try {
    await Location.requestForegroundPermissionsAsync();
    const [result] = await Location.geocodeAsync(address);
    return result
      ? { latitude: result.latitude, longitude: result.longitude, label: address, city: null }
      : null;
  } catch {
    return null;
  }
}

/** Ouvre les réglages de l'application (autorisations refusées). */
export function openAppSettings(): void {
  void Linking.openSettings();
}
