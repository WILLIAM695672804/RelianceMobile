import { router } from 'expo-router';

import { RechargeScreen } from '@/features/wallet';

export default function RechargeRouteScreen() {
  return <RechargeScreen onDone={() => router.back()} />;
}
