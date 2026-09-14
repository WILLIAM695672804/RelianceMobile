// Modules natifs absents de l'environnement Jest.

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
