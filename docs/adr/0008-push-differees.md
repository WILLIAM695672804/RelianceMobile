# ADR 0008 — Notifications push différées

- Statut : acceptée (14/09/2026)

## Contexte

L'envoi FCM n'est pas implémenté côté backend (`NotificationService`, TODO) ; `push-tokens/*` n'a donc aucun effet.

## Décision

Aucune intégration push dans ce lot. Les notifications sont servies par l'API et le canal `notifications.{userId}`.

## Conséquences

- Pas de dépendance `expo-notifications` à ce stade.
- À réexaminer dès que le backend émettra réellement des notifications push.
