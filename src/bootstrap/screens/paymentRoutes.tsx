import { router } from 'expo-router';

import { MoneyFlowContainer } from '@/features/wallet';

const toConfirmation = (id: string) =>
  router.replace({ pathname: '/wallet/payments/[id]', params: { id } });

/** Recharge du portefeuille : le paiement initié mène à sa confirmation. */
export function RechargeRoute() {
  return (
    <MoneyFlowContainer
      mode="topUp"
      onBack={() => router.back()}
      onDone={() => router.back()}
      onPending={toConfirmation}
    />
  );
}

/** Retrait : la demande initiée mène à sa confirmation. */
export function WithdrawRoute() {
  return (
    <MoneyFlowContainer
      mode="withdraw"
      onBack={() => router.back()}
      onDone={() => router.back()}
      onPending={toConfirmation}
    />
  );
}
