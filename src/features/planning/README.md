# Feature `planning`

Disponibilités du technicien et rendez-vous.

## Périmètre

| Écran                  | Composant              | Route                                    |
| ---------------------- | ---------------------- | ---------------------------------------- |
| E25 — Planning         | `PlanningScreen`       | `app/(planning)/planning/index.tsx`      |
| Créneaux hebdomadaires | `TimeSlotsScreen`      | `app/(planning)/planning/time-slots.tsx` |
| Indisponibilités       | `ExceptionsScreen`     | `app/(planning)/planning/exceptions.tsx` |
| Rendez-vous            | `AppointmentsScreen`   | `app/(planning)/appointments/index.tsx`  |
| Planification          | `NewAppointmentScreen` | `app/(planning)/appointments/new.tsx`    |

Règles appliquées côté mobile : heures au format `HH:MM` (le serveur renvoie parfois `HH:MM:SS`), fin postérieure au début, indisponibilités exprimées en journées entières (`00:00` → `23:59`), durée de rendez-vous par défaut de deux heures. Les transitions de statut proposées suivent `scheduled → confirmed → in_progress → completed`, avec annulation et absence possibles ; seul le technicien les déclenche.

## Endpoints

| Fonction                    | Méthode et route                     | Hook                         |
| --------------------------- | ------------------------------------ | ---------------------------- |
| `fetchCalendar`             | `GET /technician/calendar`           | `useCalendar`                |
| `createTimeSlot`            | `POST /technician/time-slots`        | `useCreateTimeSlot`          |
| `deleteTimeSlot`            | `DELETE /technician/time-slots/{id}` | `useDeleteTimeSlot`          |
| `createException`           | `POST /technician/exceptions`        | `useCreateException`         |
| `deleteException`           | `DELETE /technician/exceptions/{id}` | `useDeleteException`         |
| `fetchAppointments`         | `GET /appointments`                  | `useAppointments`            |
| `fetchUpcomingAppointments` | `GET /appointments/upcoming`         | `useUpcomingAppointments`    |
| `createAppointment`         | `POST /appointments`                 | `useCreateAppointment`       |
| `fetchAppointment`          | `GET /appointments/{id}`             | `useAppointment`             |
| `updateAppointmentStatus`   | `PATCH /appointments/{id}/status`    | `useUpdateAppointmentStatus` |

## Fixtures

`src/test/fixtures/planning/` — capturées par `./scripts/capture-planning-fixtures.sh`, puis anonymisées.

## Limites connues

- `day_of_week` suit Carbon : 0 correspond à dimanche ; l'affichage ordonne la semaine du lundi au dimanche.
- `insights.total_hours` retombe sur 45 heures quand aucun créneau n'est déclaré : la charge peut dépasser 100 %.
- `POST /appointments` ne vérifie ni l'attribution de la demande au technicien, ni les chevauchements.
- Le statut vaut `null` dans la réponse de création ; il est présenté comme « planifié ».
- Aucune vue calendaire graphique : les créneaux sont listés par jour.
