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
