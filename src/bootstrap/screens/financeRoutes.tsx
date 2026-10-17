import { router, useLocalSearchParams } from 'expo-router';

import { PaymentConfirmationScreen, TransactionDetailScreen } from '@/features/wallet';

/** Détail d'un mouvement du portefeuille. */
export function TransactionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TransactionDetailScreen transactionId={id} onBack={() => router.back()} />;
}

/** Confirmation d'un paiement en attente, ouverte après une recharge ou un retrait. */
export function PaymentConfirmationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PaymentConfirmationScreen
      paymentId={id}
      onBack={() => router.back()}
      onDone={() => router.replace('/wallet')}
    />
  );
}
