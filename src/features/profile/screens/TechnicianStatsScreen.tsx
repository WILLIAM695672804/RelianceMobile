import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card, ListItem, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatRating } from '@/shared/format';

import { useTechnicianStats } from '../hooks/useTechnician';
import type { TechnicianStats } from '../schemas/technicianSchemas';

/** Statistiques d'activité du technicien : soldes, gains, missions et répartitions. */
export function TechnicianStatsScreen() {
  const { t } = useTranslation();
  const stats = useTechnicianStats();

  const renderContent = () => {
    if (stats.isPending) return <StateView status="loading" />;
    if (stats.isError) {
      return <StateView status="error" error={stats.error} onRetry={() => void stats.refetch()} />;
    }
    return <StatsContent stats={stats.data} />;
  };

  return (
    <Screen onRefresh={() => void stats.refetch()} refreshing={stats.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('profile:activity.title')}
      </Text>
      {renderContent()}
    </Screen>
  );
}

/** Carte d'un indicateur : intitulé puis valeur mise en avant. */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="subtitle">{value}</Text>
    </Card>
  );
}

function StatsContent({ stats }: { stats: TechnicianStats }) {
  const { t } = useTranslation();
  const hasActivity = stats.missions_total > 0 || stats.recent_missions.length > 0;

  return (
    <>
      <View style={styles.metrics}>
        <Metric
          label={t('profile:activity.available')}
          value={formatAmount(stats.available_balance ?? 0)}
        />
        <Metric
          label={t('profile:activity.monthlyEarnings')}
          value={formatAmount(stats.monthly_earnings ?? 0)}
        />
        <Metric
          label={t('profile:activity.totalEarnings')}
          value={formatAmount(stats.total_earnings ?? 0)}
        />
        <Metric
          label={t('profile:activity.missions')}
          value={t('profile:activity.missionsValue', {
            completed: stats.missions_completed,
            total: stats.missions_total,
          })}
        />
        <Metric
          label={t('profile:activity.completionRate')}
          value={t('profile:activity.rate', { rate: stats.completion_rate ?? 0 })}
        />
        <Metric
          label={t('profile:activity.rating')}
          value={t('profile:activity.ratingValue', {
            rating: formatRating(stats.rating ?? 0),
            count: stats.num_reviews ?? 0,
          })}
        />
      </View>

      {stats.category_breakdown.length > 0 ? (
        <>
          <Text variant="subtitle">{t('profile:activity.byCategory')}</Text>
          {stats.category_breakdown.map((entry) => (
            <ListItem
              key={entry.label}
              label={entry.label}
              detail={t('profile:activity.count', { count: entry.value })}
            />
          ))}
        </>
      ) : null}

      {stats.monthly_missions.length > 0 ? (
        <>
          <Text variant="subtitle">{t('profile:activity.byMonth')}</Text>
          {stats.monthly_missions.map((month) => (
            <ListItem
              key={month.label}
              label={month.label}
              detail={t('profile:activity.count', { count: month.count })}
            />
          ))}
        </>
      ) : null}

      <Text variant="subtitle">{t('profile:activity.recent')}</Text>
      {hasActivity ? (
        stats.recent_missions.map((mission) => (
          <ListItem
            key={mission.id}
            label={mission.title}
            detail={[mission.category, mission.city].filter(Boolean).join(' · ')}
          />
        ))
      ) : (
        <StateView status="empty" message={t('profile:activity.empty')} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  metrics: { gap: 12 },
});
