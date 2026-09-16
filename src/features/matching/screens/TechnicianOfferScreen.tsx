import { useRequest } from '@/features/requests';
import { Screen, StateView } from '@/shared/components';

import { useTechnicianProfile } from '../hooks/useMatching';
import { OfferForm } from './OfferForm';
import { TechnicianProfileSummary } from './TechnicianProfileSummary';

export interface TechnicianOfferScreenProps {
  requestId: string;
  technicianId: string;
  /** Proposition envoyée : retour au détail de la demande. */
  onSent: () => void;
}

/** E12 — Détail d'un technicien proposé et envoi de la proposition. */
export function TechnicianOfferScreen({
  requestId,
  technicianId,
  onSent,
}: TechnicianOfferScreenProps) {
  const profile = useTechnicianProfile(technicianId);
  const request = useRequest(requestId);

  const renderContent = () => {
    if (profile.isError) {
      return (
        <StateView status="error" error={profile.error} onRetry={() => void profile.refetch()} />
      );
    }
    if (request.isError) {
      return (
        <StateView status="error" error={request.error} onRetry={() => void request.refetch()} />
      );
    }
    if (profile.isPending || request.isPending) return <StateView status="loading" />;
    return (
      <>
        <TechnicianProfileSummary profile={profile.data} />
        <OfferForm
          requestId={requestId}
          technicianId={technicianId}
          suggestedPrice={request.data.analysis?.suggested_price ?? null}
          onSent={onSent}
        />
      </>
    );
  };

  return <Screen scroll>{renderContent()}</Screen>;
}
