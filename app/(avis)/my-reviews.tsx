import { router } from 'expo-router';

import { MyReviewsScreen } from '@/features/reviews';

export default function MyReviewsRoute() {
  return <MyReviewsScreen onBack={() => router.back()} />;
}
