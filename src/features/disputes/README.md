# Feature `disputes`

Litiges : contestation d'une intervention et échanges avec la médiation.

## Périmètre

| Écran            | Composant             | Route                              |
| ---------------- | --------------------- | ---------------------------------- |
| Mes litiges      | `DisputesScreen`      | `app/(litiges)/disputes/index.tsx` |
| Ouvrir un litige | `DisputeFormScreen`   | `app/(litiges)/disputes/new.tsx`   |
| Fil d'un litige  | `DisputeThreadScreen` | `app/(litiges)/disputes/[id].tsx`  |

Un litige s'ouvre depuis le contrôle qualité ou le détail d'une demande ; il se consulte
depuis le compte. Le fil se ferme dès que la médiation a tranché.

## Endpoints

| Fonction             | Méthode et route              | Hook                    |
| -------------------- | ----------------------------- | ----------------------- |
| `fetchDisputes`      | `GET /disputes`               | `useDisputes`           |
| `fetchDispute`       | `GET /disputes/{id}`          | `useDispute`            |
| `openDispute`        | `POST /disputes`              | `useOpenDispute`        |
| `postDisputeMessage` | `POST /disputes/{id}/message` | `usePostDisputeMessage` |

## Fixtures

`src/test/fixtures/disputes/` — capturées par `./scripts/capture-governance-fixtures.sh`,
puis anonymisées.

## Limites connues

- La résolution appartient à l'administration (`POST /admin/disputes/{id}/resolve`, hors mobile) :
  l'application présente la décision, elle ne la prend pas.
- `POST /disputes/{id}/message` renvoie 422 sur un litige résolu ou clos ; l'écran retire alors
  la zone de saisie.
- Les pièces jointes sont acceptées par l'API (`attachments`) mais ne sont pas encore envoyées
  depuis l'application.
- `GET /disputes` renvoie le paginateur Laravel à plat, sans enveloppe `data` externe,
  contrairement aux autres listes du serveur.
