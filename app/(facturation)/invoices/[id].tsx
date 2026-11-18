import { router, useLocalSearchParams } from 'expo-router';

import { InvoiceContainer } from '@/features/billing';

export default function InvoiceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InvoiceContainer invoiceId={id} onBack={() => router.back()} />;
}
