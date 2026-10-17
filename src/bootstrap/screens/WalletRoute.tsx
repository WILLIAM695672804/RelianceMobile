import { router } from 'expo-router';

import { WalletScreen } from '@/features/wallet';

/** Portefeuille relié aux formulaires de recharge, de retrait et au détail d'un mouvement. */
export function WalletRoute() {
  return (
    <WalletScreen
      onRecharge={() => router.push('/wallet/recharge')}
      onWithdraw={() => router.push('/wallet/withdraw')}
      onOpenTransaction={(id) =>
        router.push({ pathname: '/wallet/transactions/[id]', params: { id } })
      }
    />
  );
}
