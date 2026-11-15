/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Le premier rendu d'un écran dépasse 5 s sous charge parallèle avec mesure de couverture.
  testTimeout: 15000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/design/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/*.d.ts',
    '!src/test/**',
    // Adaptateurs natifs et singletons de production : couverts par la recette manuelle.
    '!src/core/api/cookies.ts',
    '!src/core/theme/fonts.ts',
    '!src/bootstrap/instance.ts',
  ],
  coverageThreshold: {
    global: { lines: 90, branches: 75, functions: 85, statements: 90 },
    './src/core/': { lines: 85, branches: 85, functions: 85, statements: 85 },
  },
};
