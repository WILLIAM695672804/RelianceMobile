import { router } from 'expo-router';

import { WalletContainer } from '@/features/wallet';

/** Portefeuille hors onglets (agence, liens profonds), relié aux mêmes écrans que l'onglet. */
export function WalletRoute() {
  return (
    <WalletContainer
      onTopUp={() => router.push('/wallet/recharge')}
      onWithdraw={() => router.push('/wallet/withdraw')}
      onMovement={(id) => router.push({ pathname: '/wallet/transactions/[id]', params: { id } })}
      onBack={() => router.back()}
    />
  );
}
