# Feature `matching`

Rapprochement entre une demande et les techniciens vérifiés, propositions et accueil technicien.

## Périmètre

| Écran                         | Composant               | Route                                                        |
| ----------------------------- | ----------------------- | ------------------------------------------------------------ |
| E11 — Techniciens disponibles | `MatchingScreen`        | `app/(demande)/requests/[id]/matching.tsx`                   |
| E12 — Profil et proposition   | `TechnicianOfferScreen` | `app/(demande)/requests/[id]/technicians/[technicianId].tsx` |
| E06 — Accueil technicien      | `TechnicianHomeScreen`  | `app/technicien/index.tsx`                                   |

Règles appliquées côté mobile : classement par score décroissant et cinq techniciens au plus (`rankTechnicians`) ; prix entier strictement positif, message de 1000 caractères au plus ; propositions expirées ou décidées écartées (`isActionable`) ; acceptation désactivée tant qu'une mission est en cours. Le serveur reste l'arbitre : une proposition expirée renvoie 410, dont le message est affiché.

## Endpoints

| Fonction                 | Méthode et route                        | Hook                   |
| ------------------------ | --------------------------------------- | ---------------------- |
| `findTechnicians`        | `POST /requests/{id}/match`             | `useMatchResults`      |
| `selectTechnician`       | `POST /requests/{id}/select-technician` | `useSelectTechnician`  |
| `fetchTechnicianProfile` | `GET /technicians/{id}/profile`         | `useTechnicianProfile` |
| `fetchReceivedProposals` | `GET /proposals/my`                     | `useReceivedProposals` |
| `fetchActiveMission`     | `GET /proposals/active-mission`         | `useActiveMission`     |
| `acceptProposal`         | `POST /proposals/{id}/accept`           | `useAcceptProposal`    |
| `refuseProposal`         | `POST /proposals/{id}/refuse`           | `useRefuseProposal`    |

## Canaux temps réel

`proposals.{id}` : `ProposalCreated` invalide `matchingKeys.all` ; `ProposalAccepted` et `ProposalRefused` invalident `requestsKeys.all` (`useProposalsSync`, monté dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/matching/` — capturées par `./scripts/capture-matching-fixtures.sh` (deux demandes, deux propositions : l'une refusée, l'autre acceptée), puis anonymisées.

## Limites connues

- `POST /match` est traité comme une lecture : il ne crée rien et se borne à marquer la demande analysée.
- Le profil public expose courriel et téléphone ; le schéma mobile les écarte.
- Seule la première page de `GET /proposals/my` est lue.
