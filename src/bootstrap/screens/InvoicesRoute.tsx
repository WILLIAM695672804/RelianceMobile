import { router } from 'expo-router';

import { InvoicesScreen } from '@/features/billing';

/** Liste des factures reliée au détail d'une facture. */
export function InvoicesRoute() {
  return (
    <InvoicesScreen onOpen={(id) => router.push({ pathname: '/invoices/[id]', params: { id } })} />
  );
}
