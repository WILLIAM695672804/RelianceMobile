# Reliance Mobile

Application mobile de la plateforme Reliance (clients, techniciens, agences), en React Native + Expo.

## Prérequis

| Outil            | Version            | Remarque                                                                                                                                              |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js          | 24 LTS (`.nvmrc`)  | `nvm use`                                                                                                                                             |
| JDK              | 17 ou 21           | validé avec OpenJDK 21 (Gradle 9.3.1, AGP 8.12)                                                                                                       |
| SDK Android      | API 36             | `cmdline-tools` suffisent (sans Android Studio) : `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`, `ndk;27.1.12297006`, `cmake;3.22.1` |
| Backend Reliance | `RelianceBackend/` | API sur le port 8010, WebSocket sur le port 6001                                                                                                      |

Le projet exige une **development build** (modules natifs : cookies, MMKV) ; Expo Go n'est pas pris en charge.

## Installation

```bash
nvm use
npm ci
cp .env.example .env
npm run android   # compile et installe la development build sur l'émulateur
npm start         # serveur Metro pour les lancements suivants
```

## Commandes

| Commande                          | Rôle                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run typecheck`               | Vérification TypeScript                                     |
| `npm run lint`                    | ESLint, dont la règle de dépendance entre couches           |
| `npm run format` / `format:check` | Prettier                                                    |
| `npm test` / `test:coverage`      | Jest ; seuils bloquants : 70 % global, 85 % sur `src/core/` |
| `npm run doctor`                  | Diagnostic Expo                                             |

## Variables d'environnement

| Variable                      | Exemple (émulateur Android)    | Rôle                                                                                   |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ENV`             | `development`                  | `development`, `staging` ou `production`                                               |
| `EXPO_PUBLIC_API_URL`         | `http://10.0.2.2:8010`         | Racine du backend (sans `/api/v1`)                                                     |
| `EXPO_PUBLIC_WS_HOST`         | `10.0.2.2`                     | Hôte du serveur WebSocket                                                              |
| `EXPO_PUBLIC_WS_PORT`         | `6001`                         | Port du serveur WebSocket                                                              |
| `EXPO_PUBLIC_WS_KEY`          | `reliance-key`                 | Clé Pusher (`PUSHER_APP_KEY` du backend)                                               |
| `EXPO_PUBLIC_STATEFUL_ORIGIN` | `http://mobile.reliance.local` | Origine envoyée dans `Origin`/`Referer` ; doit figurer dans `SANCTUM_STATEFUL_DOMAINS` |

## Réseau de développement

- Émulateur Android : l'hôte est joignable en `10.0.2.2` ; appareil physique : IP locale de la machine (par exemple `192.168.1.159`), téléphone et poste sur le même réseau.
- Backend : `php artisan serve --host=0.0.0.0 --port=8010` ; WebSocket : `php artisan websockets:serve` (écoute sur `0.0.0.0:6001`). Le port 8000 est occupé par un autre projet du poste.
- Backend, `.env` : `SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173,localhost:5173,mobile.reliance.local` puis `php artisan config:clear`.
- Sur appareil physique, le backend doit aussi connaître son adresse publique, faute de quoi les
  URL de `storage` renvoyées par l'API restent injoignables depuis le téléphone :
  `APP_URL=http://192.168.1.159:8010` et l'ajout de `192.168.1.159:8010` à
  `SANCTUM_STATEFUL_DOMAINS`, suivis de `php artisan config:clear`.
- Appareil physique sans Wi-Fi (données mobiles seules) : ouvrir deux tunnels inverses par USB,
  `adb reverse tcp:8010 tcp:8010` et `adb reverse tcp:6001 tcp:6001`, puis viser `127.0.0.1`
  dans `.env` (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_HOST`) et dans `APP_URL` côté backend.
  Les tunnels disparaissent à chaque redémarrage du démon `adb`.
- Pare-feu, le cas échéant : `sudo ufw allow from 192.168.1.0/24 to any port 8010,6001 proto tcp`.

### Compilation sur poste à mémoire contrainte

Le dossier `android/` est généré (`npx expo prebuild`) et ignoré par git. Sur une machine à mémoire limitée, brider la compilation dans `android/gradle.properties` — `org.gradle.parallel=false`, `org.gradle.workers.max=2`, `kotlin.compiler.execution.strategy=in-process` — et lancer `taskset -c 0-1 ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a`. Ces réglages sont perdus à chaque `prebuild --clean`.

## Adaptativité

L'interface suit les conventions Android (Material 3) et s'ajuste à la fenêtre courante.

| Classe de taille | Largeur      | Gouttière | Largeur de contenu | Échelle du texte |
| ---------------- | ------------ | --------- | ------------------ | ---------------- |
| `compact`        | < 360 dp     | 12 dp     | non bornée         | 0,92             |
| `medium`         | 360 à 599 dp | 16 dp     | non bornée         | 1                |
| `expanded`       | 600 à 839 dp | 24 dp     | 640 dp, centrée    | 1,08             |
| `large`          | ≥ 840 dp     | 32 dp     | 720 dp, centrée    | 1,12             |

La mise à l'échelle du texte demandée par le système est honorée jusqu'à un facteur de 1,4.
Les grilles déduisent leur nombre de colonnes de la largeur utile, les cibles tactiles mesurent
au moins 48 dp, le thème suit le réglage clair/sombre du système et la rotation est permise.

`react-native-svg` étant un module natif, et l'orientation comme le thème relevant du manifeste,
toute recette sur appareil exige une recompilation :

```bash
npx expo run:android
```

## Comptes de test

| Rôle           | Compte                                         | Source                                                 |
| -------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Technicien     | `tech.electricien@reliance.cm` / `password123` | `TechnicianSeeder`                                     |
| Client         | `client.capture@example.test` / `password123`  | créé par `./scripts/capture-matching-fixtures.sh`      |
| Agence         | `agence.capture@example.test` / `password123`  | créé par `./scripts/capture-agency-social-fixtures.sh` |
| Administrateur | `admin@reliance.cm`                            | redirigé vers « espace réservé au web »                |

## Parcours couverts

| Rôle       | Onglets                            | Depuis « Compte »                                                                                                                                                              |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Client     | Accueil, Suivi, Annuaire, Compte   | profil, mot de passe, adresses, factures, rendez-vous, portefeuille, notifications, messagerie, fil, litiges                                                                   |
| Technicien | Accueil, Mission, Activité, Compte | installation, profil professionnel, compétences, zone, planning, justificatifs, factures, rendez-vous, portefeuille, avis, réputation, notifications, messagerie, fil, litiges |
| Agence     | Agence, Compte                     | profil, mot de passe, adresses, notifications, messagerie, fil                                                                                                                 |

Parcours d'intervention de bout en bout : demande (E10) → rapprochement (E11) → proposition (E12)
→ acceptation (E06) → suivi (E13 à E15, E18) → devis (E16, E17) → rapport d'intervention →
contrôle qualité et libération du séquestre → avis → facture (E22). Un litige peut être ouvert
depuis le contrôle qualité ou le détail d'une demande ; le technicien peut annuler sa mission.

## Documentation

- [Architecture](docs/architecture.md)
- [Guide de développement](docs/guide-developpement.md)
- [Contrat API](docs/contrat-api.md)
- [Décisions d'architecture](docs/adr/)
- [Spécification des fondations](docs/specs/2026-09-14-reliance-mobile-fondations-design.md)
- [Feature `auth`](src/features/auth/README.md)
- [Feature `profile`](src/features/profile/README.md)
- [Feature `kyc`](src/features/kyc/README.md)
- [Feature `requests`](src/features/requests/README.md)
- [Feature `interventions`](src/features/interventions/README.md)
- [Feature `disputes`](src/features/disputes/README.md)
- [Feature `matching`](src/features/matching/README.md)
- [Feature `directory`](src/features/directory/README.md)
- [Feature `missions`](src/features/missions/README.md)
- [Feature `billing`](src/features/billing/README.md)
- [Feature `notifications`](src/features/notifications/README.md)
- [Feature `chat`](src/features/chat/README.md)
- [Feature `wallet`](src/features/wallet/README.md)
- [Feature `reviews`](src/features/reviews/README.md)
- [Feature `planning`](src/features/planning/README.md)
- [Feature `agency`](src/features/agency/README.md)
- [Feature `social`](src/features/social/README.md)
