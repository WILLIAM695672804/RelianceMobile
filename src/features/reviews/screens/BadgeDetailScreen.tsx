import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { Badge, Icon, Screen, StateView, Text, type IconName } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useBadgeCatalog, useUserBadges } from '../hooks/useReviews';

/** Icône d'un badge, rapprochée du jeu des maquettes. */
const BADGE_ICONS: Record<string, IconName> = {
  check: 'check',
  star: 'star',
  clock: 'clock',
  flash: 'flash',
  shield: 'shield',
  heart: 'heart',
  badge: 'badge',
  sparkle: 'sparkle',
  wrench: 'wrench',
  bolt: 'bolt',
  grid: 'grid',
};

export interface BadgeDetailScreenProps {
  /** Code du badge, tel que le serveur le publie. */
  code: string;
  /** Technicien dont l'obtention est vérifiée. */
  userId: string;
  onBack?: () => void;
}

/** Détail d'un badge : intitulé, condition d'obtention et date, ou mention « non obtenu ». */
export function BadgeDetailScreen({ code, userId, onBack }: BadgeDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const catalog = useBadgeCatalog();
  const earned = useUserBadges(userId);
  const badge = (catalog.data ?? []).find((entry) => entry.code === code) ?? null;
  const mine = (earned.data ?? []).find((entry) => entry.code === code) ?? null;
  const title = badge?.title ?? mine?.title ?? null;

  return (
    <Screen title={t('reviews:badge.title')} onBack={onBack}>
      {catalog.isPending || earned.isPending ? <StateView status="loading" /> : null}
      {catalog.isError ? (
        <StateView status="error" error={catalog.error} onRetry={() => void catalog.refetch()} />
      ) : null}
      {!catalog.isPending && !earned.isPending && title === null ? (
        <StateView status="empty" message={t('reviews:badge.unknown')} />
      ) : null}
      {title !== null ? (
        <View style={styles.center}>
          <View
            style={[
              styles.mark,
              { backgroundColor: theme.tint.primary, borderRadius: theme.radius.lg },
            ]}
          >
            <Icon
              name={BADGE_ICONS[badge?.icon_ref ?? mine?.icon_ref ?? ''] ?? 'badge'}
              size={44}
              tone="primary"
            />
          </View>
          <Text variant="title" accessibilityRole="header" style={styles.centered}>
            {title}
          </Text>
          <Badge
            label={t(mine ? 'reviews:badge.earned' : 'reviews:badge.notEarned')}
            tone={mine ? 'success' : 'neutral'}
          />
          {badge?.description ? (
            <Text tone="muted" style={styles.centered}>
              {badge.description}
            </Text>
          ) : null}
          {mine?.awarded_at ? (
            <Text variant="caption" tone="muted">
              {t('reviews:badge.awardedAt', { date: formatDate(mine.awarded_at) })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  mark: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
