// Modules natifs absents de l'environnement Jest.

// La fenêtre par défaut de jest-expo mesure 750 points de large, ce qui place tous les
// écrans dans la classe « expanded ». Les tests s'exécutent donc sur un gabarit de
// téléphone Android représentatif ; les tests d'adaptativité substituent cette mesure.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 412, height: 915, scale: 2.625, fontScale: 1 }),
}));

jest.mock('./modules/reliance-cookies', () => ({
  __esModule: true,
  default: {
    getCookieValue: jest.fn(async () => null),
    flush: jest.fn(async () => undefined),
    clearAll: jest.fn(async () => undefined),
  },
}));

// MMKV substitue lui-même une instance en mémoire sous Jest, mais importe Nitro dès le chargement.
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => {
      throw new Error('Objet hybride Nitro indisponible sous Jest.');
    }),
  },
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    granted: true,
    status: 'granted',
    canAskAgain: true,
  })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 3.848, longitude: 11.5021 },
  })),
  reverseGeocodeAsync: jest.fn(async () => [
    { street: 'Rue de la démonstration', city: 'Yaoundé', formattedAddress: null },
  ]),
  geocodeAsync: jest.fn(async () => [{ latitude: 4.0511, longitude: 9.7679 }]),
}));
