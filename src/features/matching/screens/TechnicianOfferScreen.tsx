import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useRequest } from '@/features/requests';
import { QueryGate, Screen, TopBar } from '@/shared/ui';

import { useTechnicianProfile } from '../hooks/useMatching';
import { OfferForm } from './OfferForm';
import { TechnicianProfileSummary } from './TechnicianProfileSummary';

export interface TechnicianOfferScreenProps {
  requestId: string;
  technicianId: string;
  /** Proposition envoyée : retour au détail de la demande. */
  onSent: () => void;
  onBack?: () => void;
}

/** E12 — Détail d'un technicien proposé et envoi de la proposition. */
export function TechnicianOfferScreen({
  requestId,
  technicianId,
  onSent,
  onBack,
}: TechnicianOfferScreenProps) {
  const { t } = useTranslation();
  const profile = useTechnicianProfile(technicianId);
  const request = useRequest(requestId);

  return (
    <Screen testID="offre-technicien">
      <TopBar title={t('matching:offer.yourOffer')} onBack={onBack} />
      <QueryGate queries={[profile, request]}>
        {() => (
          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            <TechnicianProfileSummary profile={profile.data!} />
            <OfferForm
              requestId={requestId}
              technicianId={technicianId}
              suggestedPrice={request.data!.analysis?.suggested_price ?? null}
              onSent={onSent}
            />
          </View>
        )}
      </QueryGate>
    </Screen>
  );
}
