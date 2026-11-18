import { router } from 'expo-router';

import { ComposeContainer } from '@/features/social';

export default function ComposeRoute() {
  return <ComposeContainer onDone={() => router.back()} />;
}
