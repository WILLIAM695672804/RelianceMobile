# Contrat API — Reliance Mobile

Source de vérité : le code de `RelianceBackend/` (`php artisan route:list --path=api/v1`).

## 1. Correspondance features ↔ endpoints ↔ écrans

Voir la spécification, § 5.2. Ce tableau est tenu à jour à mesure de l'implémentation.

| Feature         | État         | Endpoints implémentés                                                                                                                                                                |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth`          | Plan 1       | `auth/login`, `auth/register`, `auth/logout`, `auth/me`, `auth/forgot-password`, `auth/reset-password`, `auth/2fa/{generate,enable,disable}`, `auth/email/verification-notification` |
| Autres features | Plans 2 et 3 | —                                                                                                                                                                                    |

## 2. Réponses d'authentification constatées

| Cas                                        | Statut | Corps                                                        |
| ------------------------------------------ | ------ | ------------------------------------------------------------ |
| Connexion réussie                          | 200    | `{ message: "Connexion réussie", user }` (rôles chargés)     |
| Identifiants invalides                     | 401    | `{ message: "Identifiants invalides" }`                      |
| Compte désactivé                           | 403    | `{ message: "Compte désactivé" }`                            |
| 2FA requise                                | 403    | `{ message: "Code 2FA requis", requires_2fa: true }`         |
| Code 2FA invalide                          | 401    | `{ message: "Code 2FA invalide" }`                           |
| Inscription                                | 201    | `{ message: "Inscription réussie", user }` (session ouverte) |
| E-mail non vérifié (middleware `verified`) | 403    | `{ message: "Your email address is not verified." }`         |

## 3. Statuts

| Objet       | Valeurs                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| Demande     | `pending`, `analyzed`, `matching`, `proposed`, `accepted`, `completed`, `cancelled` |
| Proposition | `sent`, `view`, `accepted`, `refused`, `expired`                                    |
| Mission     | `pending`, `en_route`, `arrived`, `in_progress`, `completed`, `cancelled`           |
| Devis       | `draft`, `sent`, `accepted`, `rejected`, `expired`                                  |

## 4. Temps réel

Aucun événement ne définit `broadcastAs` : le nom diffusé est `App\Events\<Classe>`. Écoute mobile : `listen('<Classe>')`, sans point initial. Le frontend web écoute `'.<Classe>'`, forme qui désigne littéralement `<Classe>` et ne correspond pas au nom diffusé : point à vérifier côté web.

## 5. Écarts constatés dans les PDF

| Sujet                       | PDF                                                                                            | Backend                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Authentification            | Jeton Bearer, `POST /auth/refresh`                                                             | Session web + CSRF ; pas de route `refresh`          |
| Canaux                      | `private-user.{id}`, `private-job.{id}`, `private-wallet.{id}`                                 | `user.{id}`, `jobs.{jobId}`, `wallet.{userId}`, etc. |
| Statuts de mission          | `created → accepted → diagnostic_done → quote_sent …`                                          | voir § 3                                             |
| Rôles                       | `technician`, `agency`                                                                         | `technicien`, `agence`                               |
| Routes (Document 5, ch. 16) | `/jobs/available`, `/chat/messages`, `/schedule`, `/agency/jobs`, `/agency/assign`, `/profile` | inexistantes                                         |
| Notifications push          | envoyées via FCM                                                                               | squelette non implémenté                             |

## 6. Observations de sécurité backend

- `User::$hidden` ne masque que `password` et `remember_token` : `two_factor_secret` et `two_factor_recovery_codes` sont sérialisés dans `/auth/me` et `/auth/login`. Le mobile les ignore (schéma Zod strict), mais la correction relève du backend.
