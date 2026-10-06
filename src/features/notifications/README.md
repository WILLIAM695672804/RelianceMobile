# Feature `notifications`

Centre de notifications et préférences de canaux.

## Périmètre

| Écran                 | Composant                    | Route                                           |
| --------------------- | ---------------------------- | ----------------------------------------------- |
| E23 — Notifications   | `NotificationsScreen`        | `app/(notifications)/notifications.tsx`         |
| Préférences de canaux | `NotificationSettingsScreen` | `app/(notifications)/notification-settings.tsx` |

La liste présente la première page (20 éléments), le compteur de non-lues et deux actions : marquer une notification, tout marquer comme lu. Les préférences couvrent quatre canaux ; la notification poussée est signalée comme non disponible, le serveur ne l'envoyant pas.

## Endpoints

| Fonction                     | Méthode et route                  | Hook                            |
| ---------------------------- | --------------------------------- | ------------------------------- |
| `fetchNotifications`         | `GET /notifications`              | `useNotifications`              |
| `fetchUnreadCount`           | `GET /notifications/unread-count` | `useUnreadNotificationCount`    |
| `markNotificationRead`       | `POST /notifications/{id}/read`   | `useMarkNotificationRead`       |
| `markAllNotificationsRead`   | `POST /notifications/read-all`    | `useMarkAllNotificationsRead`   |
| `fetchNotificationSettings`  | `GET /notification-settings`      | `useNotificationSettings`       |
| `updateNotificationSettings` | `PUT /notification-settings`      | `useUpdateNotificationSettings` |

## Canaux temps réel

`notifications.{userId}` → `NotificationCreated` invalide `notificationsKeys.all` (`useNotificationsSync`, monté dans `src/bootstrap/RealtimeBridge.tsx`).

## Fixtures

`src/test/fixtures/notifications/` — capturées par `./scripts/capture-messaging-fixtures.sh`, puis anonymisées.

## Limites connues

- `GET /notifications` renvoie la pagination Laravel brute : les champs de page sont à la racine, sans enveloppe `meta`.
- Le serveur ne produit des notifications qu'à l'attribution administrateur et à l'expiration d'une proposition.
- Aucune notification poussée : `push-tokens/*` est hors périmètre.
