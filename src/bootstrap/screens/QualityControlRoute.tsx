import { router, useLocalSearchParams } from 'expo-router';

import { QualityContainer } from '../containers/QualityContainer';

/** Validation des travaux : relie la notation, la facture, le litige et l'accueil. */
export function QualityControlRoute() {
  const { id, technicianId } = useLocalSearchParams<{ id: string; technicianId: string }>();
  return (
    <QualityContainer
      requestId={id}
      technicianId={technicianId}
      onBack={() => router.back()}
      onRate={(requestId) =>
        router.replace({ pathname: '/reviews/new/[requestId]', params: { requestId } })
      }
      onDispute={(requestId, against) =>
        router.push({ pathname: '/disputes/new', params: { requestId, against } })
      }
      onInvoices={() => router.replace('/invoices')}
      onHome={() => router.dismissTo('/client')}
    />
  );
}
