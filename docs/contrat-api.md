# Contrat API — Reliance Mobile

Source de vérité : le code de `RelianceBackend/` (`php artisan route:list --path=api/v1`).

## 1. Correspondance features ↔ endpoints ↔ écrans

Voir la spécification, § 5.2. Ce tableau est tenu à jour à mesure de l'implémentation.

| Feature         | État                                              | Endpoints implémentés                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`          | Livré (Plan 1, recette appareil en attente)       | `auth/login`, `auth/register`, `auth/logout`, `auth/me`, `auth/forgot-password`, `auth/reset-password`, `auth/2fa/{generate,enable,disable}`, `auth/email/verification-notification`                                                                            |
| `profile`       | Livré (Plans 2 et 4, recette appareil en attente) | `auth/profile`, `auth/profile/password`, `auth/profile/avatar`, `locations`, `locations/{id}`, `locations/{id}/default`, `auth/request-upgrade`, `technician/profile`, `technician/location`, `technician/skills`, `technician/skills/{id}`, `technician/stats` |
| `directory`     | Livré (Plan 4, recette appareil en attente)       | `technicians`, `technicians/{id}/profile`                                                                                                                                                                                                                       |
| `kyc`           | Livré (Plan 2, recette appareil en attente)       | `auth/kyc/mine`, `auth/kyc/upload`                                                                                                                                                                                                                              |
| `requests`      | Livré (Plan 3, recette appareil en attente)       | `requests` (GET, POST), `requests/{id}`, `skills`                                                                                                                                                                                                               |
| `matching`      | Livré (Plan 3, recette appareil en attente)       | `requests/{id}/match`, `requests/{id}/select-technician`, `technicians/{id}/profile`, `proposals/my`, `proposals/active-mission`, `proposals/{id}/accept`, `proposals/{id}/refuse`                                                                              |
| `missions`      | Livré (Plan 5, recette appareil en attente)       | `jobs` (GET, POST), `jobs/{id}`, `jobs/{id}/status`, `jobs/{id}/phases`, `jobs/{id}/tracking`, `mission/active`, `position/update`, `position/technician`                                                                                                       |
| `billing`       | Livré (Plan 6, recette appareil en attente)       | `quotes` (POST), `quotes/{id}`, `quotes/{id}/{send,accept,reject}`, `requests/{requestId}/quotes`, `invoices`, `invoices/{id}`, `invoices/{id}/pay`                                                                                                             |
| `notifications` | Livré (Plan 7, recette appareil en attente)       | `notifications`, `notifications/{id}/read`, `notifications/read-all`, `notifications/unread-count`, `notification-settings` (GET, PUT)                                                                                                                          |
| `chat`          | Livré (Plan 7, recette appareil en attente)       | `conversations` (GET, POST), `conversations/{id}`, `conversations/unread-count`, `conversations/{id}/messages` (GET, POST), `conversations/{id}/messages/read`                                                                                                  |
| `wallet`        | Livré (Plan 8, recette appareil en attente)       | `wallet`, `wallet/transactions`, `wallet/recharge`, `wallet/withdraw`                                                                                                                                                                                           |
| `reviews`       | Livré (Plan 8, recette appareil en attente)       | `reviews` (POST), `reviews/technician/{id}`, `reviews/mine`, `badges/user/{id}`, `reputation/{id}`                                                                                                                                                              |
| Autres features | Plans 4 et suivants                               | —                                                                                                                                                                                                                                                               |

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

### Profil et justificatifs

| Cas                                          | Statut | Corps                                                                      |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| Profil mis à jour                            | 200    | `{ message: "Profil mis à jour", user }` (rôles non chargés)               |
| Ancien mot de passe incorrect                | 400    | `{ message: "L'ancien mot de passe est incorrect." }`                      |
| Avatar mis à jour                            | 200    | `{ message: "Avatar mis à jour", avatar_url }` (URL absolue sur `APP_URL`) |
| Adresse créée                                | 201    | `{ message: "Adresse ajoutée avec succès", location }`                     |
| Passage technicien déjà acquis ou en attente | 422    | `{ message }` sans `errors`                                                |
| Justificatif soumis                          | 200    | `{ message: "Document KYC soumis", document: { id, type, status, url } }`  |

### Demandes et rapprochement

| Cas                             | Statut | Corps                                                                    |
| ------------------------------- | ------ | ------------------------------------------------------------------------ |
| Demande créée                   | 201    | `{ status: "success", data: request }` (statut `new`)                    |
| Demande invalide                | 422    | `{ message, errors }`                                                    |
| Rapprochement                   | 200    | `{ status, data: { technicians, scoring_details } }`                     |
| Proposition envoyée             | 201    | `{ status, message, data: proposal }` (statut `pending`, expire en 24 h) |
| Proposition acceptée ou refusée | 200    | `{ status: "success", message }`                                         |
| Proposition expirée             | 410    | `{ message }`                                                            |
| Aucune mission en cours         | 200    | `{ status: "success", data: null }`                                      |

### Volet technicien et annuaire

| Cas                           | Statut | Corps                                                              |
| ----------------------------- | ------ | ------------------------------------------------------------------ |
| Profil professionnel          | 200    | `{ status, data: IdentityHubResource }`                            |
| Présentation enregistrée      | 200    | `{ status, data: IdentityHubResource }`                            |
| Zone enregistrée              | 200    | `{ status, message, data: IdentityHubResource }`                   |
| Zone invalide                 | 422    | `{ message, errors: { latitude, longitude, radius } }`             |
| Compétence ajoutée ou retirée | 200    | `{ status, message }`                                              |
| Compétence invalide           | 422    | `{ message, errors: { skill_id, proficiency, experience_years } }` |
| Statistiques                  | 200    | objet plat, **sans** enveloppe `data`                              |
| Annuaire                      | 200    | pagination Laravel de `TechnicianCardResource` (20 par page)       |

### Suivi d'intervention

| Cas                           | Statut | Corps                                                                   |
| ----------------------------- | ------ | ----------------------------------------------------------------------- |
| Mission créée                 | 201    | `{ data: JobResource }` (statut `pending`, `phases: null`)              |
| Statut mis à jour             | 200    | `{ data: JobResource }`                                                 |
| Statut invalide               | 422    | `{ message, errors: { status } }`                                       |
| Mission d'un autre technicien | 403    | `{ message: "Non autorisé" }`                                           |
| Phases enregistrées           | 200    | `{ data: JobResource }`                                                 |
| Suivi d'une mission           | 200    | `{ status, data: { job_id, status, phases, technician } }`              |
| Mission en cours du client    | 200    | `{ status, data }` ou `data: null`                                      |
| Position transmise            | 200    | `{ status: "ok" }` (sans `data`)                                        |
| Position du technicien        | 200    | `{ status, data: { latitude, longitude, updated_at } }` ou `data: null` |

### Devis et factures

| Cas                 | Statut | Corps                                                      |
| ------------------- | ------ | ---------------------------------------------------------- |
| Devis créé          | 201    | `{ data: QuoteResource }` (statut `draft`)                 |
| Devis invalide      | 422    | `{ message, errors: { request_id, total_amount } }`        |
| Devis envoyé        | 200    | `{ data: QuoteResource }` (statut `sent`)                  |
| Devis déjà envoyé   | 422    | `{ message }` **sans** `errors`                            |
| Devis accepté       | 200    | `{ status, message, data: { quote, invoice_id } }`         |
| Devis non décidable | 422    | `{ message }` **sans** `errors`                            |
| Devis refusé        | 200    | `{ data: QuoteResource }` (statut `rejected`)              |
| Factures            | 200    | pagination Laravel de `InvoiceResource` (reçues et émises) |
| Paiement déclaré    | 200    | `{ data: InvoiceResource }` (statut `paid`)                |
| Facture déjà payée  | 422    | `{ message }` **sans** `errors`                            |

### Notifications et messagerie

| Cas                             | Statut | Corps                                                           |
| ------------------------------- | ------ | --------------------------------------------------------------- |
| Notifications                   | 200    | pagination Laravel **brute** (champs de page à la racine)       |
| Compteur de non-lues            | 200    | `{ count }`                                                     |
| Notification marquée            | 200    | `{ message }`                                                   |
| Préférences                     | 200    | `{ data: [{ channel, enabled }] }` (valeurs par défaut si vide) |
| Conversation créée ou retrouvée | 201    | `{ status, message, data: ConversationResource }`               |
| Conversation invalide           | 422    | `{ message, errors: { members } }`                              |
| Messages                        | 200    | pagination de `MessageResource`, **ordre décroissant**          |
| Message envoyé                  | 201    | `{ status, message, data: MessageResource }`                    |
| Message vide sans pièce jointe  | 422    | `{ message, errors: { body } }`                                 |
| Fil marqué comme lu             | 200    | `{ status, message }`                                           |

### Portefeuille et avis

| Cas                           | Statut | Corps                                                             |
| ----------------------------- | ------ | ----------------------------------------------------------------- |
| Portefeuille                  | 200    | `{ data: { balance, available_balance, held_amount, currency } }` |
| Historique                    | 200    | pagination de `TransactionResource`                               |
| Recharge initiée              | 200    | `{ message, payment_id, external_ref, status: "pending" }`        |
| Recharge refusée (passerelle) | 422    | `{ message, payment_id, status: "failed" }`                       |
| Retrait enregistré            | 200    | `{ message, payment_id }`                                         |
| Solde insuffisant             | 422    | `{ message: "Solde insuffisant" }`                                |
| Avis déposé                   | 201    | `{ status, message, data: review, new_badges }`                   |
| Avis déjà déposé              | 409    | `{ message }`                                                     |
| Avis d'un technicien          | 200    | `{ data: paginator }` (pagination **imbriquée**)                  |
| Réputation                    | 200    | `{ data: paginator, total }`                                      |

## 3. Statuts

| Objet       | Valeurs                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Demande     | `new`, `analyzed`, `quoted`, `assigned`, `completed`, `cancelled` (les commentaires de migration, obsolètes, citent `pending`, `matching`, `proposed`, `accepted`) |
| Proposition | `pending`, `accepted`, `refused`, `rejected` (propositions concurrentes à l'acceptation), `expired` (la migration cite `sent`, `view`)                             |
| Mission     | `pending`, `en_route`, `arrived`, `in_progress`, `completed`, `cancelled`                                                                                          |
| Devis       | `draft`, `sent`, `accepted`, `rejected`, `expired`                                                                                                                 |

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
- `POST /auth/forgot-password` valide `exists:users,email` : la réponse 422 permet l'énumération des comptes.
- `SANCTUM_STATEFUL_DOMAINS` doit contenir `mobile.reliance.local` (origine déclarée par le mobile).
- `avatar_url` et l'`url` des justificatifs sont construits sur `APP_URL` : sur appareil physique, `APP_URL` doit désigner une adresse joignable depuis le téléphone (par exemple `http://192.168.1.159:8010`), faute de quoi les images ne se chargent pas.
- `KycController::upload` ne relit pas le modèle : `document.status` vaut `null` dans la réponse, bien que la base enregistre `pending`.
- `GET /technicians/{id}/profile`, route publique, sérialise le courriel et le téléphone du technicien. Le mobile les écarte (schéma Zod), mais la correction relève du backend.
- `POST /requests/{id}/select-technician` et `GET /proposals/my` renvoient les modèles `User` bruts du client et du technicien (même exposition que `/auth/me`).
- `GET /technician/stats` ne respecte pas l'enveloppe `{ status, data }` des autres routes : la réponse est l'objet de statistiques lui-même.
- `POST /technician/skills` écrit `experience_years` dans le `meta` du pivot ; les compétences créées par le seeder renvoient donc `0`.
- `GET /technicians` ne filtre pas sur le KYC : un technicien listé peut avoir `kyc_approved: false`.
- `POST /jobs` ne vérifie pas que la demande est attribuée au technicien appelant.
- `POST /position/update` ne respecte pas l'enveloppe `{ status, data }` : la réponse est `{ "status": "ok" }`.
- `GET /position/technician` renvoie la position du technicien de la dernière proposition `pending` ou `accepted` du client, sans vérifier qu'une mission est en cours.
- Le statut de la demande n'est pas repassé à `completed` lorsque la mission est achevée : seul `technician_jobs.status` l'est.
- `Quote::isAcceptable()` autorise l'acceptation d'un devis `draft` : un brouillon jamais envoyé peut être accepté par le client qui en connaît l'identifiant. Le mobile ne présente que les devis `sent`.
- `GET /requests/{requestId}/quotes` ne vérifie pas que l'appelant est le client ou le technicien de la demande.
- `POST /invoices/{id}/pay` ne déclenche aucun mouvement financier : la facture est simplement marquée payée.
- `GET /notifications` ne passe par aucune ressource : les colonnes de la table (dont `user_id`) sont exposées telles quelles, et la pagination n'est pas enveloppée.
- Deux défauts bloquaient la messagerie, corrigés dans `RelianceBackend` (commit `fix(social)`) : `MessageResource` sérialisait la relation `attachments` non chargée — la colonne JSON homonyme masquant de surcroît la relation — et `Conversation::lastMessage()` employait `latestOfMany()`, qui agrège `MAX(uuid)`, refusé par PostgreSQL.
- `POST /reviews` renvoie le technicien brut sous `data.target`, courriel compris ; le mobile l'écarte.
- Les routes d'avis, de badges et de réputation imbriquent la pagination sous `data`, contrairement au reste de l'API.
- `JobController::updateStatus` ne clôturait pas la demande : l'avis était alors impossible (`ReviewController` exige `completed`). Corrigé dans `RelianceBackend` (commit `fix(operations)`).
