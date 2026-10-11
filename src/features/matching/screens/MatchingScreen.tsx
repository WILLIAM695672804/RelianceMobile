import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Screen, StateView, Text } from '@/shared/components';

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
        <View style={styles.searching}>
          <Icon name="sparkle" size={40} tone="primary" />
          <Text variant="subtitle">{t('matching:results.searching')}</Text>
          <StateView status="loading" />
        </View>
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
    <Screen
      title={t('matching:results.title')}
      onRefresh={() => void matches.refetch()}
      refreshing={matches.isRefetching}
    >
      {renderResults()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searching: { alignItems: 'center', gap: 12, paddingVertical: 24 },
});
