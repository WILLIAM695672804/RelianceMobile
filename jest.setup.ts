// Modules natifs absents de l'environnement Jest.
jest.mock('@react-native-cookies/cookies', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async () => ({})),
    clearAll: jest.fn(async () => true),
  },
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
