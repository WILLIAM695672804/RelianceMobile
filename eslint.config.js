const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['coverage/*', 'design/*', '.expo/*', 'android/*', 'ios/*', 'dist/*'],
  },
  {
    // Les fabriques de jest.mock ne peuvent référencer que des modules chargés par require().
    files: ['jest.setup.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      // axios 1.20 exporte aussi `create` et `isAxiosError` : `axios.create()` reste l'idiome documenté.
      'import/no-named-as-default-member': 'off',
      // Règle de dépendance (spécification § 3).
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: ['./src/shared', './src/features', './src/bootstrap', './app'],
              message: "core/ ne dépend d'aucune autre couche interne.",
            },
            {
              target: './src/shared',
              from: ['./src/features', './src/bootstrap', './app'],
              message: 'shared/ ne dépend que de core/.',
            },
            {
              target: './src/features',
              from: ['./src/bootstrap', './app'],
              message: 'Une feature ne dépend ni de bootstrap/ ni de app/.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: "Importer une feature par son API publique : '@/features/<nom>'.",
            },
          ],
        },
      ],
    },
  },
  {
    // Écrans de présentation (refonte Clean Lavender, § 3.1) : ni données, ni navigation.
    files: ['src/features/*/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'expo-router',
              message: 'ui/ ne navigue pas : le conteneur fournit un rappel.',
            },
            { name: '@tanstack/react-query', message: 'ui/ reçoit ses données par propriétés.' },
            { name: 'axios', message: 'ui/ reçoit ses données par propriétés.' },
          ],
          patterns: [
            {
              group: ['@/features/*/*'],
              message: "Importer une feature par son API publique : '@/features/<nom>'.",
            },
            {
              group: [
                '../hooks',
                '../hooks/*',
                '../api',
                '../api/*',
                '../containers',
                '../containers/*',
              ],
              message: 'ui/ ne dépend ni des hooks, ni de l’API, ni des conteneurs.',
            },
          ],
        },
      ],
    },
  },
]);
