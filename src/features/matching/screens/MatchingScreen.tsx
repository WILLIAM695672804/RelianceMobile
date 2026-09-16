import { useTranslation } from 'react-i18next';

import { Screen, StateView, Text } from '@/shared/components';

import { useMatchResults } from '../hooks/useMatching';
import { TechnicianMatchCard } from './TechnicianMatchCard';

export interface MatchingScreenProps {
  requestId: string;
  /** Ouverture du profil du technicien et de l'offre (E12). */
  onSelect: (technicianId: string) => void;
}

/** E11 — Résultats du rapprochement : techniciens vérifiés classés par compatibilité. */
export function MatchingScreen({ requestId, onSelect }: MatchingScreenProps) {
  const { t } = useTranslation();
  const matches = useMatchResults(requestId);

  const renderResults = () => {
    if (matches.isPending) {
      return (
        <>
          <Text tone="muted">{t('matching:results.searching')}</Text>
          <StateView status="loading" />
        </>
      );
    }
    if (matches.isError) {
      return (
        <StateView status="error" error={matches.error} onRetry={() => void matches.refetch()} />
      );
    }
    if (matches.data.length === 0) {
      return <StateView status="empty" message={t('matching:results.empty')} />;
    }
    return matches.data.map((technician) => (
      <TechnicianMatchCard key={technician.id} technician={technician} onSelect={onSelect} />
    ));
  };

  return (
    <Screen onRefresh={() => void matches.refetch()} refreshing={matches.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('matching:results.title')}
      </Text>
      {renderResults()}
    </Screen>
  );
}
