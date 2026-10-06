import { router } from 'expo-router';

import { WalletScreen } from '@/features/wallet';

/** Portefeuille relié aux formulaires de recharge et de retrait. */
export function WalletRoute() {
  return (
    <WalletScreen
      onRecharge={() => router.push('/wallet/recharge')}
      onWithdraw={() => router.push('/wallet/withdraw')}
    />
  );
}
