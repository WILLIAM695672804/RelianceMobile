# Feature `social`

Fil Reliance : publications, mentions « j'aime » et commentaires.

## Périmètre

| Écran                    | Composant          | Route                         |
| ------------------------ | ------------------ | ----------------------------- |
| Fil                      | `FeedScreen`       | `app/(social)/feed.tsx`       |
| Détail d'une publication | `PostDetailScreen` | `app/(social)/posts/[id].tsx` |

Deux onglets : « Mon fil » (`/posts/feed`, comptes suivis et publications propres) et « Découvrir » (`/posts/explore`). La publication est textuelle ; les pièces jointes restent hors périmètre. La mention « j'aime » est une bascule, dont le serveur renvoie l'état et le compteur.

## Endpoints

| Fonction            | Méthode et route                | Hook              |
| ------------------- | ------------------------------- | ----------------- |
| `fetchFeed`         | `GET /posts/feed`               | `useFeed`         |
| `fetchExplore`      | `GET /posts/explore`            | `useExplore`      |
| `fetchPost`         | `GET /posts/{id}`               | `usePost`         |
| `createPost`        | `POST /posts`                   | `useCreatePost`   |
| `toggleLike`        | `POST /posts/{id}/like`         | `useToggleLike`   |
| `fetchComments`     | `GET /posts/{id}/comments`      | `useComments`     |
| `addComment`        | `POST /posts/{id}/comments`     | `useAddComment`   |
| `checkFollow`       | `GET /follows/{id}/check`       | `useFollowStatus` |
| `followUser`        | `POST /follows/{id}`            | `useFollowUser`   |
| `unfollowUser`      | `DELETE /follows/{id}`          | `useUnfollowUser` |
| `fetchFollowCounts` | `GET /users/{id}/follow-counts` | `useFollowCounts` |
| `fetchSuggestions`  | `GET /follows/suggestions`      | `useSuggestions`  |

`FollowButton` est réutilisable : il porte l'état, la bascule et le nombre d'abonnés. Le profil public d'un technicien (`@/features/directory`) s'en sert.

## Fixtures

`src/test/fixtures/social/` — capturées par `./scripts/capture-agency-social-fixtures.sh`, puis anonymisées.

## Limites connues

- Pièces jointes hors périmètre (le serveur accepte dix fichiers de 10 Mo).
- Une seule page par fil (15 publications) ; pas de défilement infini.
- Les abonnements sont gérés (`follows/*`), mais les listes d'abonnés et d'abonnements ne sont pas présentées : seuls les compteurs le sont.
- `POST /follows/{id}` répond 409 lorsque le compte est déjà suivi ; le mobile traite ce cas comme un succès.
- `/posts/{id}` exigeait une contrainte UUID pour ne pas capturer `/posts/feed` (correctif serveur `fix(social)`).
