# Feature `interventions`

Rapport d'intervention : ce que le technicien a fait, ce qu'il a employé, combien de temps.

## Périmètre

| Écran                                | Composant                  | Route                                    |
| ------------------------------------ | -------------------------- | ---------------------------------------- |
| Rapport, rédaction par le technicien | `InterventionReportScreen` | `app/(missions)/reports/[jobId].tsx`     |
| Rapport, lecture par le client       | `InterventionReportScreen` | `app/(demande)/requests/[id]/report.tsx` |

Le même écran sert les deux rôles : `mode="edit"` ouvre le formulaire, `mode="read"` présente
le rapport déposé. Le groupe de routes porte le mode, chacun étant gardé par son rôle.

## Endpoints

| Fonction               | Méthode et route                    | Hook                      |
| ---------------------- | ----------------------------------- | ------------------------- |
| `fetchInterventions`   | `GET /interventions`                | `useInterventions`        |
| `fetchIntervention`    | `GET /interventions/{id}`           | `useIntervention`         |
| `createIntervention`   | `POST /interventions`               | `useCreateIntervention`   |
| `startIntervention`    | `POST /interventions/{id}/start`    | `useStartIntervention`    |
| `completeIntervention` | `POST /interventions/{id}/complete` | `useCompleteIntervention` |

## Fixtures

`src/test/fixtures/interventions/` — capturées par `./scripts/capture-governance-fixtures.sh`,
puis anonymisées.

## Limites connues

- Le serveur ne publie l'identifiant d'une intervention nulle part ailleurs : `JobResource` ne
  le porte pas. `InterventionReportGate` le retrouve dans la liste, que l'API restreint depuis
  le correctif `fix(operations): restreint les interventions à leurs deux parties`.
- `duration_hours` est un décimal transmis en chaîne (« 1.50 ») ; le schéma le convertit.
- Les matériels sont un tableau de chaînes libres : une ligne de saisie par pièce.
- Rien ne crée d'intervention automatiquement à l'acceptation d'une mission ; le cockpit
  l'ouvre à la première rédaction du rapport.
