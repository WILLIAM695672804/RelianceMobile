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
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
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
]);
