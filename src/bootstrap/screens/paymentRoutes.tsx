import { router } from 'expo-router';

import { RechargeScreen, WithdrawScreen } from '@/features/wallet';

/** Recharge du portefeuille : le paiement initié mène à sa confirmation. */
export function RechargeRoute() {
  return (
    <RechargeScreen
      onDone={() => router.back()}
      onPending={(id) => router.replace({ pathname: '/wallet/payments/[id]', params: { id } })}
    />
  );
}

/** Retrait : la demande initiée mène à sa confirmation. */
export function WithdrawRoute() {
  return (
    <WithdrawScreen
      onDone={() => router.back()}
      onPending={(id) => router.replace({ pathname: '/wallet/payments/[id]', params: { id } })}
    />
  );
}
