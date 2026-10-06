# Feature `missions`

Suivi d'intervention : cockpit du technicien, phases de travail, historique et suivi client.

## Périmètre

| Écran                         | Composant               | Route                           |
| ----------------------------- | ----------------------- | ------------------------------- |
| E13, E14 — Cockpit technicien | `MissionCockpitScreen`  | `app/technicien/mission.tsx`    |
| E18 — Phases de travail       | `MissionPhasesCard`     | intégré au cockpit              |
| Historique des missions       | `TechnicianJobsScreen`  | `app/(missions)/jobs/index.tsx` |
| Détail d'une mission          | `JobDetailScreen`       | `app/(missions)/jobs/[id].tsx`  |
| E15 — Suivi client            | `MissionTrackingScreen` | `app/client/suivi.tsx`          |

Cycle appliqué : `pending → en_route → arrived → in_progress → completed`, un cran par action. Le technicien démarre la mission depuis sa proposition acceptée (`POST /jobs`), partage sa position à la demande, renseigne les phases pendant les travaux et clôt la mission avec un compte rendu facultatif (2000 caractères au plus).

## Endpoints

| Fonction                  | Méthode et route           | Hook                    |
| ------------------------- | -------------------------- | ----------------------- |
| `createJob`               | `POST /jobs`               | `useCreateJob`          |
| `fetchJobs`               | `GET /jobs` (`status?`)    | `useJobs`               |
| `fetchJob`                | `GET /jobs/{id}`           | `useJob`                |
| `updateJobStatus`         | `PATCH /jobs/{id}/status`  | `useUpdateJobStatus`    |
| `updateJobPhases`         | `PUT /jobs/{id}/phases`    | `useUpdateJobPhases`    |
| `fetchJobTracking`        | `GET /jobs/{id}/tracking`  | `useJobTracking`        |
| `fetchClientMission`      | `GET /mission/active`      | `useClientMission`      |
| `fetchTechnicianPosition` | `GET /position/technician` | `useTechnicianPosition` |
| `shareMyPosition`         | `POST /position/update`    | `useShareMyPosition`    |

## Canaux temps réel

`jobs.{jobId}` : `JobStatusChanged` et `PhasesUpdated` invalident `missionsKeys.all`. `tracking.{jobId}` : `TechnicianPositionUpdated` invalide la position. L'abonnement vit dans les écrans (`useJobSync(jobId)`), seuls porteurs de l'identifiant de la mission.

## Fixtures

`src/test/fixtures/missions/` — capturées par `./scripts/capture-missions-fixtures.sh`, puis anonymisées.

## Limites connues

- Aucune carte : le client voit l'heure du dernier relevé et la distance à vol d'oiseau (`distanceBetween`).
- Pas de suivi de position en arrière-plan : le partage est ponctuel, à l'initiative du technicien.
- `route` et `estimated_travel_seconds` sont ignorés (toujours nuls côté serveur).
- Le statut de la demande reste `assigned` après l'achèvement de la mission.
- `GET /position/technician` suit la dernière proposition du client, pas la mission.
