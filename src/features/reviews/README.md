# Feature `reviews`

Avis, réputation et badges.

## Périmètre

| Écran           | Composant          | Route                                    |
| --------------- | ------------------ | ---------------------------------------- |
| Dépôt d'un avis | `ReviewFormScreen` | `app/(avis)/reviews/new/[requestId].tsx` |
| Avis reçus      | `MyReviewsScreen`  | `app/(avis)/my-reviews.tsx`              |

Le client note le technicien de 1 à 5 avec un commentaire facultatif (2000 caractères au plus), depuis le détail d'une demande clôturée. Le technicien consulte ses avis, le total de sa réputation et ses badges.

## Endpoints

| Fonction                 | Méthode et route               | Hook                   |
| ------------------------ | ------------------------------ | ---------------------- |
| `submitReview`           | `POST /reviews`                | `useSubmitReview`      |
| `fetchTechnicianReviews` | `GET /reviews/technician/{id}` | `useTechnicianReviews` |
| `fetchMyReviews`         | `GET /reviews/mine`            | `useMyReviews`         |
| `fetchUserBadges`        | `GET /badges/user/{id}`        | `useUserBadges`        |
| `fetchReputation`        | `GET /reputation/{id}`         | `useReputation`        |

## Fixtures

`src/test/fixtures/reviews/` — capturées par `./scripts/capture-finance-fixtures.sh`, puis anonymisées.

## Limites connues

- Un avis exige une demande au statut `completed` : un correctif du serveur était nécessaire pour que l'achèvement d'une mission clôture la demande.
- Le dépôt renvoie le technicien brut (`data.target`, courriel compris) : le schéma mobile l'écarte.
- `GET /badges` est vide en base de démonstration ; aucun badge n'est donc présenté au catalogue.
- Les listes imbriquent la pagination sous `data` ; une seule page (10 avis) est lue.
