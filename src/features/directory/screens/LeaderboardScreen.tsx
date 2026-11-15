import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, Screen, Snackbar, StateView, Text } from '@/shared/components';
import { formatRating } from '@/shared/format';

import { useTechnicianDirectory } from '../hooks/useDirectory';
import { rankTechnicians, type RankedTechnician } from '../model/ranking';

/** Nombre de techniciens classés. */
const RANKED = 20;

export interface LeaderboardScreenProps {
  onBack?: () => void;
  /** Ouverture du profil public d'un technicien. */
  onOpen: (technicianId: string) => void;
}

/**
 * Classement des techniciens. Transposition de `LeaderboardScreen` : à défaut d'un palmarès
 * de réputation côté serveur, l'ordre suit les notes reçues, ce que l'en-tête annonce.
 */
export function LeaderboardScreen({ onBack, onOpen }: LeaderboardScreenProps) {
  const { t } = useTranslation();
  const directory = useTechnicianDirectory({ search: '', coordinates: null });

  const renderEntry = ({ rank, technician }: RankedTechnician) => (
    <Card
      key={technician.id}
      onPress={() => onOpen(technician.id)}
      accessibilityLabel={t('directory:leaderboard.open', { name: technician.name, rank })}
    >
      <View style={styles.row}>
        <Text variant="subtitle" tone={rank <= 3 ? 'primary' : 'muted'} style={styles.rank}>
          {rank}
        </Text>
        <Avatar name={technician.name} uri={technician.avatar_url} size={40} />
        <View style={styles.identity}>
          <Text variant="subtitle" numberOfLines={1}>
            {technician.name}
          </Text>
          {technician.skills.length > 0 ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {technician.skills[0]?.name}
            </Text>
          ) : null}
        </View>
        <Text variant="subtitle">
          {technician.rating == null
            ? t('directory:leaderboard.unrated')
            : t('directory:leaderboard.score', {
                rating: formatRating(technician.rating),
                count: technician.num_reviews ?? 0,
              })}
        </Text>
      </View>
    </Card>
  );

  const renderList = () => {
    if (directory.isPending) return <StateView status="loading" />;
    if (directory.isError) {
      return (
        <StateView
          status="error"
          error={directory.error}
          onRetry={() => void directory.refetch()}
        />
      );
    }
    if (directory.data.technicians.length === 0) {
      return <StateView status="empty" message={t('directory:leaderboard.empty')} />;
    }
    return rankTechnicians(directory.data.technicians).slice(0, RANKED).map(renderEntry);
  };

  return (
    <Screen
      title={t('directory:leaderboard.title')}
      onBack={onBack}
      onRefresh={() => void directory.refetch()}
      refreshing={directory.isRefetching}
    >
      <Snackbar message={t('directory:leaderboard.basis')} tone="info" />
      {renderList()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { minWidth: 24 },
  identity: { flex: 1, gap: 2 },
});
