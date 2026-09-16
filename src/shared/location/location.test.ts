import * as Location from 'expo-location';
import { Linking } from 'react-native';

import { geocodeAddress, locateDevice, openAppSettings } from './location';

describe('location', () => {
  it('locateDevice renvoie la position et une adresse lisible', async () => {
    await expect(locateDevice()).resolves.toEqual({
      status: 'located',
      place: {
        latitude: 3.848,
        longitude: 11.5021,
        label: 'Rue de la démonstration, Yaoundé',
        city: 'Yaoundé',
      },
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.Balanced,
    });
  });

  it('locateDevice signale le refus d’autorisation', async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as Location.LocationPermissionResponse);

    await expect(locateDevice()).resolves.toEqual({ status: 'denied' });
  });

  it('locateDevice signale une position indisponible', async () => {
    jest
      .mocked(Location.getCurrentPositionAsync)
      .mockRejectedValueOnce(new Error('Location services are disabled'));

    await expect(locateDevice()).resolves.toEqual({ status: 'unavailable' });
  });

  it('locateDevice conserve la position si le géocodage inverse échoue', async () => {
    jest.mocked(Location.reverseGeocodeAsync).mockRejectedValueOnce(new Error('indisponible'));

    await expect(locateDevice()).resolves.toEqual({
      status: 'located',
      place: { latitude: 3.848, longitude: 11.5021, label: null, city: null },
    });
  });

  it('geocodeAddress convertit une adresse saisie', async () => {
    await expect(geocodeAddress('  Akwa, Douala ')).resolves.toEqual({
      latitude: 4.0511,
      longitude: 9.7679,
      label: 'Akwa, Douala',
      city: null,
    });
  });

  it('geocodeAddress renvoie null pour une adresse vide, inconnue ou en erreur', async () => {
    await expect(geocodeAddress('   ')).resolves.toBeNull();
    jest.mocked(Location.geocodeAsync).mockResolvedValueOnce([]);
    await expect(geocodeAddress('Nulle part')).resolves.toBeNull();
    jest.mocked(Location.geocodeAsync).mockRejectedValueOnce(new Error('Geocoder indisponible'));
    await expect(geocodeAddress('Akwa')).resolves.toBeNull();
  });

  it('openAppSettings ouvre les réglages de l’application', () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);

    openAppSettings();

    expect(openSettings).toHaveBeenCalledTimes(1);
    openSettings.mockRestore();
  });
});
