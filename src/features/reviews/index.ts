/**
 * Feature `reviews` — dépôt d'un avis, avis reçus, réputation et badges.
 * @packageDocumentation
 */

export { reviewsKeys } from './hooks/reviewsKeys';
export {
  useBadgeCatalog,
  useMyReviews,
  useReputation,
  useSubmitReview,
  useTechnicianReviews,
  useUserBadges,
} from './hooks/useReviews';
export { reviewsTranslations } from './i18n';
export {
  nextTierPoints,
  REPUTATION_TIERS,
  tierFor,
  tierProgress,
  TIER_THRESHOLDS,
  type ReputationTier,
} from './model/reputationTiers';
export { BadgeDetailScreen, type BadgeDetailScreenProps } from './screens/BadgeDetailScreen';
export { MyReviewsScreen } from './screens/MyReviewsScreen';
export { ReputationScreen, type ReputationScreenProps } from './screens/ReputationScreen';
export { ReviewFormScreen, type ReviewFormScreenProps } from './screens/ReviewFormScreen';
export type {
  Badge,
  CatalogBadge,
  Reputation,
  Review,
  ReviewPayload,
} from './schemas/reviewSchemas';
export {
  COMMENT_MAX_LENGTH,
  RatingView,
  type RatingValues,
  type RatingViewProps,
} from './ui/RatingView';
export {
  BadgeView,
  LeaderboardView,
  ReputationView,
  type BadgeRarity,
  type BadgeSummary,
  type LeaderEntry,
  type RankStep,
} from './ui/ReputationViews';
