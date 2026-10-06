/**
 * Feature `reviews` — dépôt d'un avis, avis reçus, réputation et badges.
 * @packageDocumentation
 */

export { reviewsKeys } from './hooks/reviewsKeys';
export {
  useMyReviews,
  useReputation,
  useSubmitReview,
  useTechnicianReviews,
  useUserBadges,
} from './hooks/useReviews';
export { reviewsTranslations } from './i18n';
export { MyReviewsScreen } from './screens/MyReviewsScreen';
export { ReviewFormScreen, type ReviewFormScreenProps } from './screens/ReviewFormScreen';
export type { Badge, Reputation, Review, ReviewPayload } from './schemas/reviewSchemas';
