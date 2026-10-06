# Feature `agency`

Espace agence : fiche et équipe.

## Périmètre

| Écran        | Composant          | Route                                               |
| ------------ | ------------------ | --------------------------------------------------- |
| E07 — Agence | `AgencyScreen`     | `app/agence/index.tsx` (accueil de l'espace agence) |
| Équipe       | `AgencyTeamScreen` | `app/(agence)/agency/team/[id].tsx`                 |

Tant que `GET /my-agency` ne renvoie rien, l'écran propose la création : le créateur devient membre `admin`. La fiche (nom, présentation, adresse, téléphone, courriel) est modifiable par un administrateur. L'équipe liste les adhésions avec leur rôle ; un technicien est rattaché depuis l'annuaire (`@/features/directory`) et retiré après confirmation.

## Endpoints

| Fonction             | Méthode et route                         | Hook                    |
| -------------------- | ---------------------------------------- | ----------------------- |
| `fetchMyAgency`      | `GET /my-agency`                         | `useMyAgency`           |
| `fetchAgency`        | `GET /agencies/{id}`                     | `useAgency`             |
| `createAgency`       | `POST /agencies`                         | `useCreateAgency`       |
| `updateAgency`       | `PUT /agencies/{id}`                     | `useUpdateAgency`       |
| `fetchAgencyMembers` | `GET /agencies/{id}/members`             | `useAgencyMembers`      |
| `addAgencyMember`    | `POST /agencies/{id}/members`            | `useAddAgencyMember`    |
| `removeAgencyMember` | `DELETE /agencies/{id}/members/{userId}` | `useRemoveAgencyMember` |

## Fixtures

`src/test/fixtures/agency/` — capturées par `./scripts/capture-agency-social-fixtures.sh`, puis anonymisées.

## Limites connues

- La table `agencies` n'a pas de propriétaire : la responsabilité repose sur l'appartenance au rôle `admin` (correctif serveur `fix(profile)`).
- Les coordonnées sont lues sous `contact_email` et `contact_phone`, mais écrites sous `email` et `phone`.
- `GET /my-agency` renvoie les membres sous forme de comptes bruts ; le schéma mobile ne retient que l'identité.
- Aucun tableau de bord d'activité d'agence : le serveur n'expose pas d'indicateurs agrégés.
