import { router, Stack, useLocalSearchParams } from 'expo-router';

import { useSession } from '@/core/session';
import { ClientQuoteContainer, RequestQuotesScreen } from '@/features/billing';

/**
 * Devis d'une demande : le client tranche sur le devis formel de la refonte ; le technicien
 * conserve l'éditeur de devis.
 */
export function QuotesRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const role = useSession((state) => state.user?.role ?? null);
  if (role === 'client') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ClientQuoteContainer
          requestId={requestId}
          onBack={() => router.back()}
          onAccepted={() => router.back()}
        />
      </>
    );
  }
  return (
    <RequestQuotesScreen requestId={requestId} onOpenInvoices={() => router.push('/invoices')} />
  );
}
