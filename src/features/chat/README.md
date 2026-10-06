# Feature `chat`

Messagerie entre le client et le technicien.

## Périmètre

| Écran                   | Composant             | Route                                      |
| ----------------------- | --------------------- | ------------------------------------------ |
| E24 — Conversations     | `ConversationsScreen` | `app/(messagerie)/conversations/index.tsx` |
| E24 — Fil de discussion | `ChatScreen`          | `app/(messagerie)/conversations/[id].tsx`  |
| Ouverture d'un fil      | `StartChatScreen`     | `app/(messagerie)/conversations/new.tsx`   |

Le serveur renvoie les messages du plus récent au plus ancien : `sortedMessages` rétablit l'ordre de lecture. Le fil est marqué lu à l'ouverture. « Contacter le client » (cockpit) et « Contacter le technicien » (suivi) passent par `/conversations/new?member=…`, qui crée la conversation privée ou retrouve celle qui existe.

## Endpoints

| Fonction                  | Méthode et route                         | Hook                      |
| ------------------------- | ---------------------------------------- | ------------------------- |
| `fetchConversations`      | `GET /conversations`                     | `useConversations`        |
| `createConversation`      | `POST /conversations`                    | `useCreateConversation`   |
| `fetchConversation`       | `GET /conversations/{id}`                | `useConversation`         |
| `fetchUnreadMessageCount` | `GET /conversations/unread-count`        | `useUnreadMessageCount`   |
| `fetchMessages`           | `GET /conversations/{id}/messages`       | `useMessages`             |
| `sendMessage`             | `POST /conversations/{id}/messages`      | `useSendMessage`          |
| `markConversationRead`    | `POST /conversations/{id}/messages/read` | `useMarkConversationRead` |

## Canaux temps réel

`conversation.{id}` → `MessageSent` et `MessageRead` invalident `chatKeys.all` (`useConversationSync`, monté dans le fil de discussion).

## Fixtures

`src/test/fixtures/chat/` — capturées par `./scripts/capture-messaging-fixtures.sh`, puis anonymisées.

## Limites connues

- Pièces jointes hors périmètre : seuls les messages texte sont envoyés (le serveur accepte 5 fichiers de 10 Mo).
- Une seule page de messages (30 éléments) est lue : pas de défilement infini.
- Deux défauts du serveur ont dû être corrigés pour exploiter la messagerie (sérialisation des pièces jointes, `latestOfMany` sur clé UUID) ; voir `docs/contrat-api.md`.
