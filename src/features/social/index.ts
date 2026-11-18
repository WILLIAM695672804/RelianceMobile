/**
 * Feature `social` — fil Reliance : publications, mentions « j'aime » et commentaires.
 * @packageDocumentation
 */

export { socialKeys } from './hooks/socialKeys';
export {
  useAddComment,
  useComments,
  useCreatePost,
  useExplore,
  useFeed,
  usePost,
  useToggleLike,
} from './hooks/useSocial';
export { socialTranslations } from './i18n';
export { FeedScreen, type FeedScreenProps } from './screens/FeedScreen';
export { PostCard, type PostCardProps } from './screens/PostCard';
export { PostDetailScreen, type PostDetailScreenProps } from './screens/PostDetailScreen';
export type { Comment, LikeResult, Post } from './schemas/socialSchemas';
export {
  useFollowCounts,
  useFollowStatus,
  useFollowUser,
  useSuggestions,
  useUnfollowUser,
} from './hooks/useFollows';
export { FollowButton, type FollowButtonProps } from './screens/FollowButton';
export { SuggestionsCard } from './screens/SuggestionsCard';
export type { FollowCounts, FollowSuggestion } from './schemas/followSchemas';
export {
  ComposeView,
  FeedView,
  PostView,
  type ComposeViewProps,
  type FeedComment,
  type FeedPost,
  type FeedViewProps,
  type PostKind,
  type PostViewProps,
} from './ui/SocialViews';
export {
  ComposeContainer,
  FeedContainer,
  PostContainer,
  toFeedPost,
  toPostContent,
  type ComposeContainerProps,
  type FeedContainerProps,
  type PostContainerProps,
} from './containers/SocialContainers';
