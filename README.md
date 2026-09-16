# Reliance Mobile

Application mobile de la plateforme Reliance (clients, techniciens, agences), en React Native + Expo.

## Prérequis

| Outil            | Version            | Remarque                                                                                                                                              |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js          | 24 LTS (`.nvmrc`)  | `nvm use`                                                                                                                                             |
| JDK              | 17 ou 21           | validé avec OpenJDK 21 (Gradle 9.3.1, AGP 8.12)                                                                                                       |
| SDK Android      | API 36             | `cmdline-tools` suffisent (sans Android Studio) : `platform-tools`, `platforms;android-36`, `build-tools;36.0.0`, `ndk;27.1.12297006`, `cmake;3.22.1` |
| Backend Reliance | `RelianceBackend/` | API (port 8000 ou 8010), WebSocket sur le port 6001                                                                                                   |

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
| `EXPO_PUBLIC_API_URL`         | `http://10.0.2.2:8000`         | Racine du backend (sans `/api/v1`)                                                     |
| `EXPO_PUBLIC_WS_HOST`         | `10.0.2.2`                     | Hôte du serveur WebSocket                                                              |
| `EXPO_PUBLIC_WS_PORT`         | `6001`                         | Port du serveur WebSocket                                                              |
| `EXPO_PUBLIC_WS_KEY`          | `reliance-key`                 | Clé Pusher (`PUSHER_APP_KEY` du backend)                                               |
| `EXPO_PUBLIC_STATEFUL_ORIGIN` | `http://mobile.reliance.local` | Origine envoyée dans `Origin`/`Referer` ; doit figurer dans `SANCTUM_STATEFUL_DOMAINS` |

## Réseau de développement

- Émulateur Android : l'hôte est joignable en `10.0.2.2` ; appareil physique : IP locale de la machine (par exemple `192.168.1.159`), téléphone et poste sur le même réseau.
- Backend : `php artisan serve --host=0.0.0.0 --port=8010` ; WebSocket : `php artisan websockets:serve` (écoute sur `0.0.0.0:6001`). Le port 8000 est occupé par un autre projet du poste.
- Backend, `.env` : `SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173,localhost:5173,mobile.reliance.local` puis `php artisan config:clear`.
- Pare-feu, le cas échéant : `sudo ufw allow from 192.168.1.0/24 to any port 8010,6001 proto tcp`.

### Compilation sur poste à mémoire contrainte

Le dossier `android/` est généré (`npx expo prebuild`) et ignoré par git. Sur une machine à mémoire limitée, brider la compilation dans `android/gradle.properties` — `org.gradle.parallel=false`, `org.gradle.workers.max=2`, `kotlin.compiler.execution.strategy=in-process` — et lancer `taskset -c 0-1 ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a`. Ces réglages sont perdus à chaque `prebuild --clean`.

## Comptes de test

| Rôle           | Compte                                         | Source                                  |
| -------------- | ---------------------------------------------- | --------------------------------------- |
| Technicien     | `tech.electricien@reliance.cm` / `password123` | `TechnicianSeeder`                      |
| Client, agence | à créer par l'écran d'inscription (E03)        | aucun seeder                            |
| Administrateur | `admin@reliance.cm`                            | redirigé vers « espace réservé au web » |

## Documentation

- [Architecture](docs/architecture.md)
- [Guide de développement](docs/guide-developpement.md)
- [Contrat API](docs/contrat-api.md)
- [Décisions d'architecture](docs/adr/)
- [Spécification des fondations](docs/specs/2026-09-14-reliance-mobile-fondations-design.md)
- [Feature `auth`](src/features/auth/README.md)
- [Feature `profile`](src/features/profile/README.md)
- [Feature `kyc`](src/features/kyc/README.md)
