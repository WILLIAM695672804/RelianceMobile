import { router } from 'expo-router';

import { WithdrawScreen } from '@/features/wallet';

export default function WithdrawRouteScreen() {
  return <WithdrawScreen onDone={() => router.back()} />;
}
