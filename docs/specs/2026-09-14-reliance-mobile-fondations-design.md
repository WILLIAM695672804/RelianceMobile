# Reliance Mobile — Fondations du projet (conception)

- **Date** : 14 septembre 2026
- **Statut** : conception validée par volets, en attente de relecture
- **Portée** : premier lot « fondations » de l'application mobile Reliance
- **Documents amont** : dossier `doc mobile/` (Documents 1, 2, 3, 5, 6 et spécification d'intégration API), backend `RelianceBackend/`, frontend `RelianceFrontend/`, maquettes `RelianceMobile/*.jsx`

---

## 1. Décisions structurantes

| #   | Décision                                                                                 | Motif                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **React Native + Expo**, et non Flutter                                                  | Réutilisation des 17 services Axios, des 9 hooks Echo, de TanStack Query et des types TypeScript du web ; compilation iOS sans Mac via EAS ; maquettes déjà rédigées en JSX. |
| D2  | **Authentification actuelle conservée** : session Sanctum par cookie + CSRF              | Choix du backend en vigueur (`AuthController` : `Auth::guard('web')->login`). Les Documents 3 et 5 (jeton Bearer, `/auth/refresh`) sont caducs sur ce point.                 |
| D3  | **Dépôt autonome** dans `RelianceMobile/`                                                | `RelianceFrontend` n'est pas modifié ; le code web est porté (copié puis adapté).                                                                                            |
| D4  | **Feature First léger** (et non Clean Architecture stricte)                              | Le mobile ne porte aucune logique métier ; DTO/entités/mappers/use cases tripleraient le volume sans bénéfice, et les dépôts dupliqueraient le cache TanStack Query.         |
| D5  | **Profondeur d'initialisation** : couche données + écrans squelettes pour chaque feature | L'interface finale fait l'objet des lots ultérieurs (V1.0 à V1.10).                                                                                                          |
| D6  | **Le code backend est la source de vérité**                                              | Les PDF comportent des écarts avérés (§ 9).                                                                                                                                  |

Les Documents 3 (architecture) et 6 (guide de développement), rédigés pour Flutter, sont **remplacés** par `docs/architecture.md` et `docs/guide-developpement.md` du nouveau dépôt. Les Documents 1 et 5 restent valides sur le plan fonctionnel ; le catalogue d'endpoints de la spécification d'intégration reste valide, ses parties Dart sont transposées.

---

## 2. Pile technique

| Besoin               | Choix                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Socle                | Expo (dernier SDK stable à l'initialisation), TypeScript `strict`                                                                       |
| Navigation           | Expo Router, routes typées, `Stack.Protected`                                                                                           |
| État serveur         | TanStack Query v5, persistance via `react-native-mmkv`                                                                                  |
| État client          | Zustand (session, préférences, connectivité)                                                                                            |
| HTTP                 | Axios, module Expo local `modules/reliance-cookies` (lecture des cookies natifs ; ADR 0004 amendé)                                      |
| Validation           | Zod, react-hook-form, `@hookform/resolvers`                                                                                             |
| Temps réel           | `laravel-echo`, `pusher-js`                                                                                                             |
| Internationalisation | i18next, react-i18next, expo-localization (fr par défaut, en prévu)                                                                     |
| Connectivité         | `@react-native-community/netinfo`                                                                                                       |
| Interface            | Design system maison : jetons issus de `design-system.jsx`, `StyleSheet`, polices Bricolage Grotesque et Inter via `@expo-google-fonts` |
| Tests                | Jest (`jest-expo`), React Native Testing Library, `axios-mock-adapter`, Maestro                                                         |
| Qualité              | ESLint (`eslint-config-expo`, `eslint-plugin-import`), Prettier, husky, lint-staged, commitlint                                         |
| Environnement        | Node LTS verrouillé par `.nvmrc`, npm                                                                                                   |

**Development build obligatoire** (et non Expo Go) : le module local `modules/reliance-cookies` et `react-native-mmkv` sont des modules natifs.

---

## 3. Arborescence

```
RelianceMobile/
├── app/                              # Expo Router — délégation pure vers features/
│   ├── _layout.tsx                   # fournisseurs : QueryClient, thème, i18n, session, Echo
│   ├── index.tsx                     # E01 Lancement (aiguillage de session)
│   ├── (auth)/                       # connexion, 2FA, inscription, mot de passe oublié
│   ├── (client)/_layout.tsx          # onglets client
│   ├── (technicien)/_layout.tsx      # onglets technicien
│   ├── (agence)/_layout.tsx          # onglets agence
│   └── web-only.tsx                  # rôle admin : « espace réservé au web »
├── src/
│   ├── core/
│   │   ├── config/                   # lecture et validation Zod des variables EXPO_PUBLIC_*
│   │   ├── api/                      # instance Axios, intercepteurs CSRF/Origin/401/419
│   │   ├── session/                  # store Zustand, restauration, déconnexion, rôles
│   │   ├── errors/                   # AppError, normalisation, report 422 → formulaire
│   │   ├── realtime/                 # Echo, registre typé des canaux, useChannelEvent
│   │   ├── offline/                  # NetInfo ↔ onlineManager, persistance, reprise des mutations
│   │   ├── i18n/                     # initialisation, ressources fr/en
│   │   ├── theme/                    # jetons clair/sombre, polices, useTheme
│   │   └── storage/                  # adaptateur MMKV
│   ├── shared/
│   │   ├── components/               # Screen, Text, Button, TextField, Card, StateView,
│   │   │                             # OfflineBanner, ConfirmDialog
│   │   ├── hooks/
│   │   └── utils/
│   ├── features/<feature>/
│   │   ├── api/                      # une fonction par endpoint
│   │   ├── schemas/                  # Zod : réponses et formulaires
│   │   ├── hooks/                    # clés de cache, requêtes, mutations, abonnements
│   │   ├── screens/                  # écrans squelettes
│   │   ├── components/
│   │   ├── index.ts                  # API publique (TSDoc)
│   │   └── README.md
│   └── test/
│       ├── fixtures/                 # réponses JSON réelles capturées
│       ├── render.tsx                # rendu avec fournisseurs de test
│       └── queryClient.ts
├── e2e/                              # parcours Maestro
├── scripts/
│   └── contract.ts                   # capture et vérification du contrat API
├── docs/
│   ├── architecture.md
│   ├── guide-developpement.md
│   ├── contrat-api.md
│   └── adr/
├── design/maquettes/                 # maquettes JSX actuelles, déplacées telles quelles
├── .github/workflows/ci.yml
├── app.config.ts
├── eas.json
└── .env.example
```

**Règle de dépendance** (appliquée par `import/no-restricted-paths`) :

- `app/` → `features/`, `shared/`, `core/`
- `features/X` → `shared/`, `core/`, et `features/Y` **uniquement via `features/Y/index.ts`**
- `shared/` → `core/`
- `core/` → aucune dépendance interne

---

## 4. Socle transverse (`src/core/`)

### 4.1 Configuration

Variables : `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_HOST`, `EXPO_PUBLIC_WS_PORT`, `EXPO_PUBLIC_WS_KEY`, `EXPO_PUBLIC_STATEFUL_ORIGIN`, `EXPO_PUBLIC_ENV` (`development` | `staging` | `production`). Elles sont validées par un schéma Zod au démarrage ; toute configuration invalide interrompt le lancement avec un message explicite.

Réseau de développement : émulateur Android → `10.0.2.2` ; appareil physique → IP locale de l'hôte. Laravel (`php artisan serve --host=0.0.0.0`) et le serveur WebSocket (port 6001) doivent écouter sur toutes les interfaces. Le trafic HTTP en clair n'est autorisé que dans le profil de développement.

### 4.2 Session Sanctum

| Mécanisme          | Comportement                                                                                                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instance HTTP      | Axios, `baseURL = ${API_URL}/api/v1`, `Accept: application/json`, `withCredentials: true` ; cookies conservés par la pile réseau native.                                                                                                                                  |
| CSRF               | Pour POST/PUT/PATCH/DELETE : appel mémorisé à `${API_URL}/sanctum/csrf-cookie`, lecture de `XSRF-TOKEN` via le module Expo local `modules/reliance-cookies`, décodage URL, en-tête `X-XSRF-TOKEN`.                                                                        |
| Réponse 419        | Invalidation de la mémorisation, nouvel appel à `csrf-cookie`, **un seul** rejeu de la requête.                                                                                                                                                                           |
| Requête stateful   | En-têtes `Origin` et `Referer` = `EXPO_PUBLIC_STATEFUL_ORIGIN`. **Prérequis backend (configuration uniquement)** : ajouter cette origine à `SANCTUM_STATEFUL_DOMAINS` dans `.env`.                                                                                        |
| Restauration (E01) | `GET /auth/me` → 200 : mise à jour du store et redirection selon le rôle ; 401 : écran de connexion ; `network`/`timeout` : si un profil minimal (id, nom, rôle) est en cache MMKV, accueil en mode dégradé, sinon écran « Vérifiez votre connexion » avec « Réessayer ». |
| Connexion          | `POST /auth/login` ; réponse 403 contenant `requires_2fa: true` → écran de saisie du code, puis nouvel envoi avec `code`. 401 → « Adresse électronique ou mot de passe incorrect » ; 403 « Compte désactivé » → message dédié.                                            |
| Expiration         | Toute réponse 401 hors `/auth/me` et `/auth/login` : purge de la session et redirection vers la connexion avec « Votre session a expiré. Veuillez vous reconnecter. »                                                                                                     |
| Déconnexion        | `POST /auth/logout`, `CookieManager.clearAll()`, `queryClient.clear()`, purge du cache persisté, `destroyEcho()`.                                                                                                                                                         |
| Rôles              | Lus dans `user.roles[].name` : `client`, `technicien`, `agence` ; `admin` → `web-only`. Rôle inconnu → écran d'erreur avec reconnexion (Document 5, ch. 3).                                                                                                               |

### 4.3 Erreurs

Toute erreur est normalisée en `AppError`, union discriminée sur `kind` :

| `kind`               | Origine                                                                                               | Action UI par défaut                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `network`, `timeout` | Absence de réponse                                                                                    | « Vérifiez votre connexion », Réessayer                                                     |
| `unauthenticated`    | 401                                                                                                   | Redirection vers la connexion                                                               |
| `forbidden`          | 403                                                                                                   | Message d'interdiction, retour                                                              |
| `emailNotVerified`   | 403 du middleware `verified` (message `Your email address is not verified.`, testé avant `forbidden`) | Message et renvoi de l'email de vérification (`POST /auth/email/verification-notification`) |
| `notFound`           | 404                                                                                                   | « Élément introuvable »                                                                     |
| `csrf`               | 419 après rejeu                                                                                       | Message générique, Réessayer                                                                |
| `validation`         | 422 (`errors: { champ: [...] }`)                                                                      | Report sous les champs via `applyServerErrors(form, error)`                                 |
| `rateLimited`        | 429                                                                                                   | « Trop de tentatives »                                                                      |
| `server`             | 5xx                                                                                                   | « Une erreur est survenue. Veuillez réessayer ultérieurement. »                             |
| `contract`           | Échec du `parse` Zod d'une réponse                                                                    | Journalisé (développement) ; message générique                                              |

Politique de relance TanStack Query : **requêtes** relancées au plus 3 fois avec délai exponentiel, uniquement pour `network` et `server` ; **mutations** jamais relancées automatiquement. Tous les messages passent par i18next.

### 4.4 Temps réel

- Instance Echo unique, créée après authentification et détruite à la déconnexion.
- `authorizer` personnalisé : `POST ${API_URL}/broadcasting/auth` via l'instance Axios (cookie, CSRF, Origin).
- Registre typé, conforme à `routes/channels.php` et aux événements `ShouldBroadcast` du backend :

| Canal                           | Événements                                                         |
| ------------------------------- | ------------------------------------------------------------------ |
| `user.{userId}`                 | `KycStatusChanged`, `RoleUpgradeDecision`                          |
| `notifications.{userId}`        | `NotificationCreated`                                              |
| `wallet.{userId}`               | `BalanceUpdated`, `HoldCaptured`, `HoldReleased`, `PaymentSettled` |
| `quotes.{userId}`               | `QuoteSubmitted`, `InvoiceCreated`                                 |
| `proposals.{userId}`            | `ProposalCreated`, `ProposalAccepted`, `ProposalRefused`           |
| `jobs.{jobId}`                  | `JobStatusChanged`, `PhasesUpdated`                                |
| `tracking.{jobId}`              | `TechnicianPositionUpdated`                                        |
| `conversation.{conversationId}` | `MessageSent`, `MessageRead`                                       |

- Hook `useChannelEvent(channel, event, handler)` : abonnement avec comptage de références, désabonnement au démontage. Les features s'en servent pour `invalidateQueries` ou `setQueryData`.
- Cycle de vie : déconnexion après 30 s en arrière-plan (`AppState`), reconnexion au retour au premier plan.

### 4.5 Mode hors ligne

- NetInfo alimente `onlineManager` (TanStack Query) et un store de connectivité ; `OfflineBanner` affiche « Vous êtes hors ligne. Certaines fonctionnalités sont limitées. »
- Cache persisté dans MMKV : **liste blanche** de clés de requête, `maxAge` 24 h, `buster` = version de l'application.
- Mutations en pause persistées et rejouées via `resumePausedMutations()` à la reconnexion. Le mécanisme est fourni par le socle ; chaque feature l'active explicitement (première utilisatrice : phases de mission, lot V1.4).

### 4.6 Navigation, thème, primitives

- `Stack.Protected` alimenté par le store de session ; un groupe de routes par rôle avec sa barre d'onglets ; schéma de liens profonds `reliance://`.
- Thème : jetons clair/sombre issus de `design-system.jsx` (couleurs, rayons, polices), suivi de `useColorScheme`.
- Primitives partagées : `Screen`, `Text`, `Button`, `TextField`, `Card`, `StateView` (chargement / erreur / vide), `OfflineBanner`, `ConfirmDialog`. Chacune expose un libellé d'accessibilité.

---

## 5. Initialisation des features

### 5.1 Gabarit

Chaque feature contient `api/`, `schemas/`, `hooks/`, `screens/`, `components/`, `index.ts` et `README.md` (voir § 3). Les hooks exposent une fabrique de clés (`requestsKeys.all`, `.list(filters)`, `.detail(id)`), des hooks de lecture et de mutation avec leurs invalidations, et les abonnements temps réel pertinents. Les écrans squelettes consomment les hooks et rendent les états chargement, erreur, vide et données (affichage brut, sans mise en forme finale).

**Règle d'arbitrage des validations de formulaire** : une règle fonctionnelle (Document 5) s'applique si elle est plus stricte que la règle backend tout en lui restant compatible ; sinon la règle backend prévaut. Exemple : description de demande limitée à 20–1000 caractères (backend : ≤ 5000) ; au moins une photo (backend : facultatif).

### 5.2 Cartographie

Les maquettes citées sont une correspondance indicative établie d'après les noms des composants de `RelianceMobile/`.

| Ordre | Feature         | Endpoints (`/api/v1/…`)                                                                                                                                                                                                  | Écrans (Document 5) | Maquettes                                                                                                            | Canaux                               |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1     | `auth`          | `auth/login`, `auth/register`, `auth/logout`, `auth/me`, `auth/forgot-password`, `auth/reset-password`, `auth/2fa/{generate,enable,disable}`, `auth/email/verification-notification`                                     | E01, E02, E03, E04  | LoginScreen, RoleSelectScreen, OnboardingScreen                                                                      | —                                    |
| 2     | `profile`       | `auth/profile` (PUT), `auth/profile/avatar`, `auth/profile/password`, `auth/request-upgrade`, `technician/profile`, `technician/location`, `technician/skills`, `technician/stats`, `skills`, `locations`                | E08, E09, E26       | ProfileScreen, TechProfileScreen, TechOnboarding*                                                                    | `user.{id}`                          |
| 2     | `kyc`           | `auth/kyc/mine`, `auth/kyc/upload`                                                                                                                                                                                       | —                   | KYCStart/Scan/Selfie/Pending/RejectedScreen                                                                          | `user.{id}`                          |
| 3     | `requests`      | `requests` (GET, POST), `requests/{id}`                                                                                                                                                                                  | E05, E10            | ClientHomeScreen, NewRequestScreen, CancelScreen                                                                     | —                                    |
| 3     | `matching`      | `requests/{id}/match`, `requests/{id}/select-technician`, `proposals/my`, `proposals/check-new`, `proposals/active-mission`, `proposals/{id}/accept`, `proposals/{id}/refuse`, `technicians`, `technicians/{id}/profile` | E06, E11, E12       | MatchingScreen, MapScreen, SearchScreen, TechHomeScreen                                                              | `proposals.{userId}`                 |
| 4     | `missions`      | `jobs`, `jobs/{id}`, `jobs/{id}/status`, `jobs/{id}/phases`, `jobs/{id}/tracking`, `mission/active`, `position/update`, `position/technician`, `interventions/*`                                                         | E13, E14, E15, E18  | InterventionScreen, DiagnosticReportScreen, ValidationScreen                                                         | `jobs.{jobId}`, `tracking.{jobId}`   |
| 4     | `quotes`        | `quotes` (POST), `quotes/{id}`, `quotes/{id}/send`, `quotes/{id}/accept`, `quotes/{id}/reject`, `requests/{requestId}/quotes`                                                                                            | E16, E17            | QuoteScreen                                                                                                          | `quotes.{userId}`                    |
| 4     | `appointments`  | `appointments`, `appointments/upcoming`, `appointments/{id}`, `appointments/{id}/status`                                                                                                                                 | —                   | —                                                                                                                    | —                                    |
| 5     | `wallet`        | `wallet`, `wallet/transactions`, `wallet/recharge`, `wallet/withdraw`, `holds`, `payments`, `payments/{id}`, `payments/{id}/confirm`                                                                                     | E19, E20, E21       | WalletScreen, WalletTopUpScreen, WalletWithdrawScreen, WalletOTPScreen, TransactionDetailScreen, EscrowReleaseScreen | `wallet.{userId}`                    |
| 5     | `invoices`      | `invoices`, `invoices/{id}`, `invoices/{id}/pay`                                                                                                                                                                         | E22                 | InvoiceScreen                                                                                                        | `quotes.{userId}` (`InvoiceCreated`) |
| 6     | `chat`          | `conversations`, `conversations/{id}`, `conversations/unread-count`, `conversations/{id}/messages` (GET, POST), `…/messages/read`, `…/messages/attachments`, `…/messages/{messageId}` (DELETE)                           | E24                 | InboxScreen, ChatScreen                                                                                              | `conversation.{id}`                  |
| 6     | `notifications` | `notifications`, `notifications/unread-count`, `notifications/read-all`, `notifications/{id}/read`, `notification-settings` (GET, PUT)                                                                                   | E23                 | NotificationsScreen, ToastsScreen                                                                                    | `notifications.{userId}`             |
| 7     | `planning`      | `technician/calendar`, `technician/time-slots`, `technician/exceptions`                                                                                                                                                  | E25                 | PlanningWeekScreen, AvailabilityScreen, LeaveRequestScreen                                                           | —                                    |
| 7     | `social`        | `posts/*`, `follows/*`, `users/{userId}/{posts,followers,following,follow-counts}`                                                                                                                                       | —                   | FeedScreen, PostDetailScreen, CreatePostScreen                                                                       | —                                    |
| 7     | `reputation`    | `reviews`, `reviews/mine`, `reviews/technician/{id}`, `badges`, `badges/user/{id}`, `reputation/{id}`                                                                                                                    | —                   | ReputationScreen, BadgeDetailScreen, LeaderboardScreen, RatingScreen                                                 | —                                    |
| 8     | `agency`        | `my-agency`, `agencies`, `agencies/{id}`, `agencies/{id}/members`                                                                                                                                                        | E07                 | AgencyDashboardScreen, AgencyTeamScreen, AssignJobScreen                                                             | —                                    |

`push-tokens/*` est hors périmètre (§ 8). Les litiges (`disputes/*`, DisputeScreen) sont hors périmètre (« Won't Have »).

### 5.3 Statuts réels à typer (énumérations Zod)

| Objet            | Valeurs (migrations backend)                                                        |
| ---------------- | ----------------------------------------------------------------------------------- |
| Demande          | `pending`, `analyzed`, `matching`, `proposed`, `accepted`, `completed`, `cancelled` |
| Proposition      | `sent`, `view`, `accepted`, `refused`, `expired`                                    |
| Mission (`jobs`) | `pending`, `en_route`, `arrived`, `in_progress`, `completed`, `cancelled`           |
| Devis            | `draft`, `sent`, `accepted`, `rejected`, `expired`                                  |

Les schémas de statut utilisent `z.enum([...]).or(z.string())` pour tolérer une valeur nouvelle sans casser l'application ; une valeur inconnue est journalisée.

### 5.4 Contrat API

- `npm run contract:capture` : s'authentifie sur le backend local avec un compte de test par rôle (identifiants lus dans `.env.contract`, non versionné), appelle les endpoints de lecture de chaque feature et enregistre les réponses anonymisées dans `src/test/fixtures/<feature>/`.
- `npm run contract:verify` : rejoue les appels et valide chaque réponse contre les schémas Zod ; sortie non nulle en cas d'écart.
- Les tests de contrat Jest valident les schémas sur les fixtures versionnées, sans backend.

---

## 6. Stratégie de tests

| Niveau           | Périmètre                                                                                                                                                                                                                           | Outils                              | Exigence                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| Unitaire `core/` | Configuration, intercepteur CSRF et rejeu 419, en-têtes Origin/Referer, 401 → expiration, normalisation `AppError`, restauration de session (tous les cas du § 4.2), registre des canaux, `useChannelEvent`, persistance hors ligne | Jest                                | **TDD** : test écrit et vu en échec avant l'implémentation |
| Contrat          | Chaque schéma de réponse contre ses fixtures                                                                                                                                                                                        | Jest                                | Une fixture minimum par schéma de réponse                  |
| API              | Méthode, URL, corps et en-têtes de chaque fonction `api/`                                                                                                                                                                           | axios-mock-adapter                  | Un test par endpoint                                       |
| Hooks            | Clés de cache, invalidations après mutation, réaction aux événements temps réel                                                                                                                                                     | `renderHook`, `QueryClient` de test | Chaque mutation vérifie ses invalidations                  |
| Écrans           | États chargement / erreur / vide / données ; garde de rôle                                                                                                                                                                          | React Native Testing Library        | Quatre états par écran squelette                           |
| Bout en bout     | Lancement → connexion → accueil par rôle                                                                                                                                                                                            | Maestro (émulateur + backend local) | Exécution locale, hors CI                                  |

**Seuils de couverture bloquants (Jest)** : 70 % global (lignes, branches, fonctions, instructions) ; 85 % sur `src/core/`.

---

## 7. Documentation, qualité et intégration continue

### 7.1 Documentation livrée

| Fichier                                                         | Contenu                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                     | Prérequis, installation, development build, commandes, variables, réseau de développement, comptes de test                                                                                                        |
| `docs/architecture.md`                                          | Remplace le Document 3 : couches, règle de dépendance, session, erreurs, temps réel, hors ligne, navigation                                                                                                       |
| `docs/guide-developpement.md`                                   | Remplace le Document 6 : conventions de nommage, GitFlow simplifié, Conventional Commits, création d'une feature pas à pas, écriture des tests, Definition of Done                                                |
| `docs/contrat-api.md`                                           | Correspondance endpoints ↔ features ↔ écrans ; statuts ; écarts constatés dans les PDF (§ 9)                                                                                                                      |
| `docs/adr/0001-expo-react-native.md` … `0008-push-differees.md` | 0001 Expo ; 0002 Feature First léger ; 0003 TanStack Query + Zustand ; 0004 session Sanctum par cookie ; 0005 design system maison ; 0006 dépôt autonome ; 0007 pile de tests ; 0008 notifications push différées |
| `src/features/*/README.md`                                      | Périmètre, endpoints, écrans, canaux, état d'avancement                                                                                                                                                           |
| TSDoc                                                           | Obligatoire sur toute exportation publique de `src/core/` et des `index.ts` de features                                                                                                                           |

### 7.2 Conventions

- Fichiers : `camelCase.ts` pour la logique, `PascalCase.tsx` pour les composants ; hooks préfixés `use` ; schémas suffixés `Schema` ; clés de cache suffixées `Keys`.
- Identifiants de code en anglais ; interface, documentation et messages de commit en français.

### 7.3 Git et CI

- Dépôt initialisé avec `main` et `develop` ; husky + lint-staged (ESLint, Prettier) au pré-commit ; commitlint (Conventional Commits) au message de commit.
- GitHub Actions (`push`, `pull_request`) : `npm ci` → `tsc --noEmit` → `eslint .` → `prettier --check .` → `jest --coverage` (seuils bloquants) → `npx expo-doctor`.
- `eas.json` préparé (profils `development`, `preview`, `production`) ; **aucune compilation EAS** dans ce lot.

---

## 8. Hors périmètre

Interface finale des écrans ; notifications push (envoi FCM non implémenté côté backend : `NotificationService`, TODO) ; géolocalisation continue ; capture et compression de photos ; files d'actions hors ligne propres aux features ; litiges ; abonnements, crédits, SLA, analytics ; configuration du compte EAS ; publication sur les stores.

---

## 9. Écarts constatés entre les PDF et le backend

| Sujet                              | PDF                                                                                            | Backend (source de vérité)                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Authentification                   | Jeton Bearer, `POST /auth/refresh`                                                             | Session web + CSRF ; pas de route `refresh` |
| Canaux temps réel                  | `private-user.{id}`, `private-job.{id}`, `private-wallet.{id}`                                 | Voir § 4.4                                  |
| Statuts de mission                 | `created → accepted → diagnostic_done → quote_sent …`                                          | Voir § 5.3                                  |
| Rôles                              | `technician`, `agency`                                                                         | `technicien`, `agence`                      |
| Routes citées (Document 5, ch. 16) | `/jobs/available`, `/chat/messages`, `/schedule`, `/agency/jobs`, `/agency/assign`, `/profile` | Inexistantes                                |
| Notifications push                 | Envoyées par le backend via FCM                                                                | Squelette non implémenté                    |

---

## 10. Prérequis d'exécution

| Prérequis                                               | État au 14/09/2026               | Responsable                                                        |
| ------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| Node LTS (via nvm)                                      | Node 25.8.1 (hors LTS) installé  | Claude (sans droits administrateur)                                |
| JDK 17                                                  | JDK 21 installé                  | Utilisateur : `sudo apt install openjdk-17-jdk`                    |
| SDK Android / Android Studio                            | Absent                           | À installer (development build, émulateur)                         |
| `SANCTUM_STATEFUL_DOMAINS`                              | Ne contient que les origines web | Ajout de `EXPO_PUBLIC_STATEFUL_ORIGIN` dans `RelianceBackend/.env` |
| Comptes de test client / technicien / agence            | À confirmer                      | Utilisateur ou seeders existants                                   |
| Backend et WebSocket accessibles depuis le réseau local | Écoute sur `127.0.0.1`           | `--host=0.0.0.0` en développement                                  |

---

## 11. Découpage de l'exécution

Le lot est trop volumineux pour une exécution d'un seul tenant ; le plan d'implémentation le découpe en phases livrables, chacune close par une CI verte :

1. **Phase 0 — Outillage** : Node LTS, projet Expo, TypeScript strict, ESLint/Prettier/husky/commitlint, Jest, CI, déplacement des maquettes, squelette documentaire.
2. **Phase 1 — Socle** : `core/` complet en TDD (§ 4), primitives `shared/`, navigation par rôle.
3. **Phase 2 — `auth`** : gabarit de référence de feature, validation de bout en bout contre le backend (critères 2 à 5).
4. **Phase 3 — Features ordres 2 à 4** : `profile`, `kyc`, `requests`, `matching`, `missions`, `quotes`, `appointments`.
5. **Phase 4 — Features ordres 5 à 8** : `wallet`, `invoices`, `chat`, `notifications`, `planning`, `social`, `reputation`, `agency`.
6. **Phase 5 — Contrat et bout en bout** : scripts de contrat, parcours Maestro, finalisation de la documentation.

---

## 12. Critères d'acceptation du lot

1. `npm run typecheck`, `npm run lint`, `npm test` passent ; les seuils de couverture sont atteints.
2. La development build Android démarre sur émulateur ; E01 aiguille correctement (session absente → connexion).
3. Connexion réelle contre le backend local pour chacun des trois rôles, avec redirection vers l'accueil du rôle ; déconnexion effective (un `GET /auth/me` ultérieur renvoie 401).
4. Une requête d'écriture authentifiée aboutit (CSRF et Origin validés par Sanctum).
5. L'autorisation d'un canal privé `user.{id}` réussit.
6. Les 16 features possèdent leur gabarit complet, leurs routes et leurs tests ; `npm run contract:verify` passe sur le backend local.
7. Le bandeau hors ligne apparaît à la coupure réseau ; les données en cache restent affichées.
8. La documentation du § 7.1 est présente et à jour ; la CI GitHub Actions est verte.
