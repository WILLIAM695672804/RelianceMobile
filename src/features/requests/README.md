# Feature `requests`

Demandes d'intervention du client : accueil, création, détail.

## Périmètre

| Écran                  | Composant             | Route                                   |
| ---------------------- | --------------------- | --------------------------------------- |
| E05 — Accueil client   | `ClientHomeScreen`    | `app/client/index.tsx`                  |
| E10 — Nouvelle demande | `NewRequestScreen`    | `app/(demande)/requests/new.tsx`        |
| Détail d'une demande   | `RequestDetailScreen` | `app/(demande)/requests/[id]/index.tsx` |

Règles appliquées côté mobile : cinq demandes ouvertes au plus (`MAX_OPEN_REQUESTS`) ; intitulé de 255 caractères au plus ; description de 20 à 1000 caractères ; une à cinq photos ; catégorie et position obligatoires. La position provient du GPS (`locateDevice`) ou du géocodage d'une adresse saisie (`geocodeAddress`), tous deux dans `src/shared/location/`.

Étapes présentées (`stageOf`) : `new`/`analyzed` → à rapprocher ; `quoted` → en attente du technicien ; `assigned` → attribuée ; `completed`/`cancelled` → clôturée.

## Endpoints

| Fonction        | Méthode et route                                                                                                                   | Hook               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `fetchRequests` | `GET /requests`                                                                                                                    | `useRequests`      |
| `fetchRequest`  | `GET /requests/{id}`                                                                                                               | `useRequest`       |
| `createRequest` | `POST /requests` (multipart `title`, `description`, `category_slug`, `latitude`, `longitude`, `address_label`, `city`, `photos[]`) | `useCreateRequest` |

Le catalogue des catégories provient de `GET /skills` (`useSkillCatalog`, feature `profile`).

## Canaux temps réel

Aucun abonnement propre ; `proposals.{id}` (`ProposalAccepted`, `ProposalRefused`) invalide `requestsKeys.all` via `useProposalsSync` (feature `matching`).

## Fixtures

`src/test/fixtures/requests/` — capturées par `./scripts/capture-matching-fixtures.sh`, puis anonymisées. Les écrans utilisent `buildServiceRequest` (`src/test/fixtures/serviceRequests.ts`).

## Limites connues

- Seule la première page de `GET /requests` est lue.
- Les photos sont servies sous `/storage` : `APP_URL` doit être joignable depuis l'appareil.
