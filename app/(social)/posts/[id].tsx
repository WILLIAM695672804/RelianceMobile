import { useLocalSearchParams } from 'expo-router';

import { PostDetailScreen } from '@/features/social';

export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetailScreen postId={id} />;
}
