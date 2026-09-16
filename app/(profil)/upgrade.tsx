import { router } from 'expo-router';

import { UpgradeRequestScreen } from '@/features/profile';

export default function UpgradeRequestRoute() {
  return <UpgradeRequestScreen onDone={() => router.back()} />;
}
