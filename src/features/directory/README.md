# Feature `directory`

Annuaire public des techniciens vérifiés et profil public.

## Périmètre

| Écran         | Composant                       | Route                                 |
| ------------- | ------------------------------- | ------------------------------------- |
| Annuaire      | `TechnicianDirectoryScreen`     | `app/client/annuaire.tsx`             |
| Profil public | `TechnicianPublicProfileScreen` | `app/(annuaire)/technicians/[id].tsx` |

Filtres appliqués : recherche par nom (`search`) et proximité (`latitude`, `longitude`, `radius_km` de 50 km, position relevée par `locateDevice`). Le serveur ne renvoie que les techniciens `verified` et `is_active` ; il classe par distance quand une position est fournie, sinon par note décroissante. Seule la première page (20 techniciens) est lue.

## Endpoints

| Fonction            | Méthode et route                                                             | Hook                     |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| `searchTechnicians` | `GET /technicians` (`search`, `skill`, `latitude`, `longitude`, `radius_km`) | `useTechnicianDirectory` |

Le profil public repose sur `useTechnicianProfile` et `TechnicianProfileSummary`, exportés par `@/features/matching`.

## Fixtures

`src/test/fixtures/directory/` — capturées par `./scripts/capture-technician-fixtures.sh`, puis anonymisées.

## Limites connues

- L'annuaire n'est pas paginé côté mobile.
- `kyc_approved` peut valoir `false` pour un technicien listé : le serveur ne filtre que sur `verified`.
