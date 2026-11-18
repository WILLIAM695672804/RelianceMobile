import { router, useLocalSearchParams } from 'expo-router';

import { PostContainer } from '@/features/social';

export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostContainer postId={id} onBack={() => router.back()} />;
}
