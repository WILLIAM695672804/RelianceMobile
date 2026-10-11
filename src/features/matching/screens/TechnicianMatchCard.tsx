import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Badge, Button, Card, Icon, Text } from '@/shared/components';
import { formatAmount, formatDistance, formatRating } from '@/shared/format';

import type { MatchedTechnician } from '../schemas/matchingSchemas';

/** Compétences citées sur la carte. */
const LISTED_SKILLS = 3;

export interface TechnicianMatchCardProps {
  technician: MatchedTechnician;
  onSelect: (technicianId: string) => void;
}

/** Carte d'un technicien proposé : score, note, distance, compétences et tarif minimal. */
export function TechnicianMatchCard({ technician, onSelect }: TechnicianMatchCardProps) {
  const { t } = useTranslation();
  const rates = technician.skills
    .map((skill) => skill.hourly_rate)
    .filter((rate): rate is number => rate != null);
  const lowestRate = rates.length > 0 ? Math.min(...rates) : null;
  const chooseLabel = t('matching:results.choose');

  return (
    <Card>
      <View style={styles.header}>
        <Avatar name={technician.name} uri={technician.avatar_url} size={48} />
        <View style={styles.identity}>
          <Text variant="subtitle">{technician.name}</Text>
          {technician.verified ? (
            <Badge label={t('matching:results.verified')} tone="success" />
          ) : null}
        </View>
      </View>
      <Badge
        label={t('matching:results.score', { score: technician.match_score })}
        tone="primary"
        icon="sparkle"
      />
      <View style={styles.metrics}>
        {technician.rating != null ? (
          <View style={styles.metric}>
            <Icon name="star" size={16} tone="warning" />
            <Text variant="caption" tone="muted">
              {t('matching:results.rating', {
                rating: formatRating(technician.rating),
                count: technician.num_reviews ?? 0,
              })}
            </Text>
          </View>
        ) : null}
        {technician.distance_km != null ? (
          <View style={styles.metric}>
            <Icon name="pin" size={16} tone="muted" />
            <Text variant="caption" tone="muted">
              {t('matching:results.distance', { distance: formatDistance(technician.distance_km) })}
            </Text>
          </View>
        ) : null}
      </View>
      {technician.skills.length > 0 ? (
        <Text>
          {t('matching:results.skills', {
            skills: technician.skills
              .slice(0, LISTED_SKILLS)
              .map((skill) => skill.name)
              .join(', '),
          })}
        </Text>
      ) : null}
      {lowestRate != null ? (
        <View style={styles.metric}>
          <Icon name="wallet" size={16} tone="muted" />
          <Text>{t('matching:results.fromRate', { amount: formatAmount(lowestRate) })}</Text>
        </View>
      ) : null}
      <Button
        label={chooseLabel}
        icon="arrowR"
        fullWidth
        accessibilityLabel={`${chooseLabel} : ${technician.name}`}
        onPress={() => onSelect(technician.id)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
