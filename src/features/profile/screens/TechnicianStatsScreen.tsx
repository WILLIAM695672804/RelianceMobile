import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount, formatRating } from '@/shared/format';
import { Card, EmptyState, ListRow, QueryGate, Screen, Section, Text, TopBar } from '@/shared/ui';

import { useTechnicianStats } from '../hooks/useTechnician';
import type { TechnicianStats } from '../schemas/technicianSchemas';

export interface TechnicianStatsScreenProps {
  onBack?: () => void;
}

/** Statistiques d'activité du technicien : soldes, gains, missions et répartitions. */
export function TechnicianStatsScreen({ onBack }: TechnicianStatsScreenProps = {}) {
  const { t } = useTranslation();
  const stats = useTechnicianStats();
  return (
    <Screen
      testID="activite"
      onRefresh={() => void stats.refetch()}
      refreshing={stats.isRefetching}
    >
      <TopBar title={t('profile:activity.title')} onBack={onBack} />
      <QueryGate queries={[stats]}>{() => <StatsContent stats={stats.data!} />}</QueryGate>
    </Screen>
  );
}

/** Tuile d'un indicateur : intitulé puis valeur mise en avant. */
function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ width: '48%', flexGrow: 1 }}>
      <Card
        padding={14}
        style={
          accent ? { backgroundColor: theme.tint.primary, borderColor: 'transparent' } : undefined
        }
      >
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="section" style={{ fontFamily: theme.fontFamily.display, marginTop: 4 }}>
          {value}
        </Text>
      </Card>
    </View>
  );
}

function StatsContent({ stats }: { stats: TechnicianStats }) {
  const { t } = useTranslation();
  const hasActivity = stats.missions_total > 0 || stats.recent_missions.length > 0;

  return (
    <>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Metric
          accent
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
        <Section title={t('profile:activity.byCategory')}>
          <View style={{ paddingHorizontal: 20 }}>
            <Card padding={0}>
              {stats.category_breakdown.map((entry, index) => (
                <ListRow
                  key={entry.label}
                  divider={index > 0}
                  title={entry.label}
                  trailing={
                    <Text variant="labelStrong" tone="primary">
                      {t('profile:activity.count', { count: entry.value })}
                    </Text>
                  }
                />
              ))}
            </Card>
          </View>
        </Section>
      ) : null}

      {stats.monthly_missions.length > 0 ? (
        <Section title={t('profile:activity.byMonth')}>
          <View style={{ paddingHorizontal: 20 }}>
            <Card padding={0}>
              {stats.monthly_missions.map((month, index) => (
                <ListRow
                  key={month.label}
                  divider={index > 0}
                  title={month.label}
                  trailing={
                    <Text variant="labelStrong" tone="primary">
                      {t('profile:activity.count', { count: month.count })}
                    </Text>
                  }
                />
              ))}
            </Card>
          </View>
        </Section>
      ) : null}

      <Section title={t('profile:activity.recent')}>
        <View style={{ paddingHorizontal: 20 }}>
          {hasActivity ? (
            <Card padding={0}>
              {stats.recent_missions.map((mission, index) => (
                <ListRow
                  key={mission.id}
                  icon="bolt"
                  divider={index > 0}
                  title={mission.title}
                  detail={[mission.category, mission.city].filter(Boolean).join(' · ')}
                />
              ))}
            </Card>
          ) : (
            <EmptyState
              icon="bolt"
              title={t('profile:activity.recent')}
              message={t('profile:activity.empty')}
            />
          )}
        </View>
      </Section>
    </>
  );
}
