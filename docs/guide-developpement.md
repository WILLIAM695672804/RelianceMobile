# Guide de développement — Reliance Mobile

Ce document remplace le Document 6 (rédigé pour Flutter).

## 1. Conventions de nommage

| Élément                   | Convention                               | Exemple             |
| ------------------------- | ---------------------------------------- | ------------------- |
| Logique                   | `camelCase.ts`                           | `restoreSession.ts` |
| Composant, écran          | `PascalCase.tsx`                         | `LoginScreen.tsx`   |
| Hook                      | préfixe `use`                            | `useLogin`          |
| Schéma Zod                | suffixe `Schema`                         | `loginFormSchema`   |
| Fabrique de clés de cache | suffixe `Keys`                           | `authKeys`          |
| Test                      | voisin du fichier, suffixe `.test.ts(x)` | `csrf.test.ts`      |

Identifiants en anglais ; interface, documentation et commits en français.

## 2. Git

- `main` : versions publiées ; `develop` : intégration ; `feature/<sujet>` : développement, fusion `--no-ff` dans `develop`.
- Conventional Commits (`feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `ci`), sujet en minuscules, contrôlé par commitlint.
- Pré-commit : ESLint et Prettier sur les fichiers indexés (lint-staged).

## 3. Créer une feature pas à pas

1. `src/features/<nom>/schemas/` : schémas Zod des réponses (d'après une fixture réelle capturée) et des formulaires.
2. `src/features/<nom>/api/` : une fonction par endpoint, recevant l'`AxiosInstance` et renvoyant une donnée validée par `parseResponse`.
3. `src/features/<nom>/hooks/` : fabrique de clés `<nom>Keys`, hooks de requête et de mutation (avec invalidations), abonnements `useChannelEvent`.
4. `src/features/<nom>/screens/` : écrans recevant leurs callbacks de navigation en propriétés ; états chargement, erreur, vide et données via `StateView`.
5. `src/features/<nom>/i18n.ts` : ressources fr/en du namespace, enregistrées dans `src/bootstrap/instance.ts` (`translations`).
6. `src/features/<nom>/index.ts` : API publique documentée en TSDoc ; `README.md` : périmètre, endpoints, écrans, canaux, état d'avancement.
7. `app/…` : fichiers de route qui importent l'écran depuis `@/features/<nom>` et câblent `router`.

La feature `auth` est le gabarit de référence.

## 4. Tests

| Niveau  | Outil                                | Règle                                                       |
| ------- | ------------------------------------ | ----------------------------------------------------------- |
| `core/` | Jest                                 | TDD : test vu en échec avant l'implémentation               |
| Contrat | Jest                                 | chaque schéma de réponse validé contre sa fixture           |
| API     | `axios-mock-adapter`                 | méthode, URL, corps, en-têtes : un test par endpoint        |
| Hooks   | `renderHook` + `createTestProviders` | chaque mutation vérifie ses invalidations                   |
| Écrans  | React Native Testing Library 14      | toujours `await render(...)` ; requêtes par rôle et libellé |

Fixtures : réponses réelles anonymisées dans `src/test/fixtures/<feature>/`.

## 5. Definition of Done

- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:coverage` passent.
- Exportations publiques documentées en TSDoc ; `README.md` de la feature à jour.
- Libellés d'interface passés par i18next ; composants interactifs dotés d'un libellé d'accessibilité.
- Aucun secret ni donnée personnelle réelle dans les fixtures.
