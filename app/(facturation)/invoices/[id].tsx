import { useLocalSearchParams } from 'expo-router';

import { InvoiceDetailScreen } from '@/features/billing';

export default function InvoiceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InvoiceDetailScreen invoiceId={id} />;
}
