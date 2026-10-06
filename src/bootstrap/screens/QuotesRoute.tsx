import { router, useLocalSearchParams } from 'expo-router';

import { RequestQuotesScreen } from '@/features/billing';

/** Devis d'une demande, reliés à la liste des factures. */
export function QuotesRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  return (
    <RequestQuotesScreen requestId={requestId} onOpenInvoices={() => router.push('/invoices')} />
  );
}
