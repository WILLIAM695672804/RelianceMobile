# Architecture — Reliance Mobile

Ce document remplace le Document 3 (rédigé pour Flutter).

## 1. Couches

| Couche                | Rôle                                                                                                                                                                        | Peut importer                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `app/`                | Routes Expo Router ; délégation pure                                                                                                                                        | tout                                                      |
| `src/bootstrap/`      | Composition des singletons (client HTTP, session, cache, temps réel), fournisseurs, navigateur racine, écrans transverses (E01, web-only) et liaison de E08 à la navigation | `core`, `shared`, `features`                              |
| `src/features/<nom>/` | Une capacité métier : `api/`, `schemas/`, `hooks/`, `screens/`, `components/`, `index.ts`                                                                                   | `core`, `shared`, autres features **via leur `index.ts`** |
| `src/shared/`         | Primitives d'interface et utilitaires                                                                                                                                       | `core`                                                    |
| `src/core/`           | Socle technique sans connaissance métier                                                                                                                                    | bibliothèques et `modules/`                               |
| `modules/`            | Modules natifs locaux (Expo Modules API, Kotlin + Swift), découverts par l'autoliaison                                                                                      | `expo`                                                    |

La règle est imposée par `import/no-restricted-paths` (ESLint). Toute importation profonde `@/features/x/...` est interdite.

Dépendances entre features autorisées à ce jour : `profile` → `auth` (compte, double authentification, déconnexion) ; `requests` → `profile` (catalogue des compétences) ; `matching` → `requests` (clés de cache, lecture d'une demande). `src/shared/location/` encapsule `expo-location` (position, géocodage) et `src/shared/format/` les formats d'affichage (montants FCFA, distances, notes, dates). `src/shared/media/` encapsule `expo-image-picker` (galerie, appareil photo) pour les features qui téléversent des fichiers ; l'envoi `multipart/form-data` passe par `core/api/upload.ts`.

**Écarts avec la spécification** : groupes de rôle sous forme de répertoires nommés (`app/client`, `app/technicien`, `app/agence`) pour éviter le conflit de trois routes `/` ; ajout de `src/core/query/` et de `src/bootstrap/`.

## 2. Session Sanctum par cookie

- Client Axios : `baseURL = ${EXPO_PUBLIC_API_URL}/api/v1`, `withCredentials`, en-têtes `Accept`, `X-Requested-With`, `Origin` et `Referer` fixés à `EXPO_PUBLIC_STATEFUL_ORIGIN`. Les cookies (`laravel_session`, `XSRF-TOKEN`) sont conservés par la pile réseau native.
- Requêtes d'écriture : `CsrfManager` appelle une fois `/sanctum/csrf-cookie` (mémorisation), lit `XSRF-TOKEN` via le module Expo local `modules/reliance-cookies`, le décode (`decodeURIComponent`) et l'envoie dans `X-XSRF-TOKEN`.
- 419 : invalidation de la mémorisation et **un seul** rejeu. 401 hors `/auth/me` et `/auth/login` : purge locale et retour à la connexion avec « Votre session a expiré ».
- Restauration (E01) : `GET /auth/me` ; en cas d'absence de réseau, bascule en mode dégradé si un profil minimal est en cache MMKV.
- Déconnexion : `POST /auth/logout` (au mieux), purge des cookies, du cache TanStack Query et de sa persistance, arrêt du temps réel, purge du profil.

## 3. Erreurs

Toute erreur est normalisée en `AppError` (`kind` : `network`, `timeout`, `unauthenticated`, `forbidden`, `emailNotVerified`, `twoFactorRequired`, `notFound`, `csrf`, `validation`, `rateLimited`, `server`, `contract`, `unknown`). Les réponses sont validées par Zod (`parseResponse`) ; un écart de contrat produit `contract`. Les erreurs 422 sont reportées sous les champs par `applyServerErrors`.

## 4. État

- **Serveur** : TanStack Query. Requêtes relancées au plus trois fois (délai exponentiel) pour `network`, `timeout` et `server` ; mutations jamais relancées.
- **Client** : Zustand (session, connectivité, temps réel).
- **Persistance** : MMKV ; seules les requêtes marquées `meta: { persist: true }` sont persistées (24 h, invalidation par version de l'application).

## 5. Temps réel

Echo (pilote `pusher`) sur `laravel-websockets`. Autorisation des canaux privés via le client Axios (`POST /broadcasting/auth`). Les événements du backend ne définissent pas `broadcastAs` : Laravel les diffuse sous leur nom de classe complet (`App\Events\BalanceUpdated`). Le mobile les écoute **sans point initial** (`listen('BalanceUpdated')`), ce qu'Echo convertit en `App\Events\BalanceUpdated` grâce à son espace de noms par défaut. `useChannelEvent` gère le comptage de références ; la connexion est suspendue après 30 s en arrière-plan.

## 6. Hors ligne

NetInfo alimente `onlineManager` et le store de connectivité ; `OfflineBanner` signale la coupure. Les mutations en pause sont reprises au rétablissement et après restauration du cache.

## 7. Navigation

`Stack.Protected` alimenté par `computeGuards(session)` : `index` (démarrage), `(auth)`, `client` et `(demande)` (parcours d'une demande : `/requests/new`, `/requests/[id]`, `/requests/[id]/matching`, `/requests/[id]/technicians/[technicianId]`), `technicien`, `agence`, `(profil)`, `web-only` (administrateur ou rôle inconnu). Schéma de liens profonds : `reliance://`.
