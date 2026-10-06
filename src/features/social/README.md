# Feature `social`

Fil Reliance : publications, mentions « j'aime » et commentaires.

## Périmètre

| Écran                    | Composant          | Route                         |
| ------------------------ | ------------------ | ----------------------------- |
| Fil                      | `FeedScreen`       | `app/(social)/feed.tsx`       |
| Détail d'une publication | `PostDetailScreen` | `app/(social)/posts/[id].tsx` |

Deux onglets : « Mon fil » (`/posts/feed`, comptes suivis et publications propres) et « Découvrir » (`/posts/explore`). La publication est textuelle ; les pièces jointes restent hors périmètre. La mention « j'aime » est une bascule, dont le serveur renvoie l'état et le compteur.

## Endpoints

| Fonction        | Méthode et route            | Hook            |
| --------------- | --------------------------- | --------------- |
| `fetchFeed`     | `GET /posts/feed`           | `useFeed`       |
| `fetchExplore`  | `GET /posts/explore`        | `useExplore`    |
| `fetchPost`     | `GET /posts/{id}`           | `usePost`       |
| `createPost`    | `POST /posts`               | `useCreatePost` |
| `toggleLike`    | `POST /posts/{id}/like`     | `useToggleLike` |
| `fetchComments` | `GET /posts/{id}/comments`  | `useComments`   |
| `addComment`    | `POST /posts/{id}/comments` | `useAddComment` |

## Fixtures

`src/test/fixtures/social/` — capturées par `./scripts/capture-agency-social-fixtures.sh`, puis anonymisées.

## Limites connues

- Pièces jointes hors périmètre (le serveur accepte dix fichiers de 10 Mo).
- Une seule page par fil (15 publications) ; pas de défilement infini.
- Les abonnements (`follows/*`) ne sont pas exposés : « Mon fil » reste vide tant qu'aucun compte n'est suivi, d'où l'onglet « Découvrir ».
- `/posts/{id}` exigeait une contrainte UUID pour ne pas capturer `/posts/feed` (correctif serveur `fix(social)`).
