import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  AdaptiveGrid,
  Card,
  Icon,
  IconTile,
  ListItem,
  Screen,
  SectionHeader,
  StateView,
  StatTile,
  StepIndicator,
  Text,
  type IconName,
} from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useBadgeCatalog, useReputation, useUserBadges } from '../hooks/useReviews';
import { nextTierPoints, tierFor } from '../model/reputationTiers';
import type { Badge as EarnedBadge, CatalogBadge } from '../schemas/reviewSchemas';

/** Icône d'un badge : le serveur renvoie un nom libre, rapproché du jeu des maquettes. */
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

function iconFor(ref: string | null | undefined): IconName {
  return (ref && BADGE_ICONS[ref]) || 'badge';
}

export interface ReputationScreenProps {
  /** Technicien dont la réputation est consultée. */
  userId: string;
  onBack?: () => void;
  onOpenBadge: (code: string) => void;
  onOpenLeaderboard: () => void;
}

/** Réputation : palier, progression, badges obtenus et à conquérir, historique des variations. */
export function ReputationScreen({
  userId,
  onBack,
  onOpenBadge,
  onOpenLeaderboard,
}: ReputationScreenProps) {
  const { t } = useTranslation();
  const reputation = useReputation(userId);
  const earned = useUserBadges(userId);
  const catalog = useBadgeCatalog();
  const total = reputation.data?.total ?? 0;
  const tier = tierFor(total);
  const next = nextTierPoints(total);
  const earnedCodes = new Set((earned.data ?? []).map((badge) => badge.code));

  const renderTier = () => (
    <Card tone="primary">
      <View style={styles.tierHeader}>
        <Icon name="badge" size={28} tone="primary" />
        <View style={styles.tierTitles}>
          <Text variant="subtitle">
            {t('reviews:reputation.tier', { tier: t(`reviews:reputation.tiers.${tier}`) })}
          </Text>
          <Text tone="muted">{t('reviews:reputation.points', { total })}</Text>
        </View>
      </View>
      <StepIndicator
        steps={5}
        current={['bronze', 'silver', 'gold', 'platinum', 'diamond'].indexOf(tier)}
        testID="reputation-tiers"
      />
      <Text variant="caption" tone="muted">
        {next === null
          ? t('reviews:reputation.maxTier')
          : t('reviews:reputation.toNext', { points: next - total })}
      </Text>
    </Card>
  );

  const renderBadges = () => {
    if (earned.isPending || catalog.isPending) return <StateView status="loading" />;
    const catalogBadges: CatalogBadge[] = catalog.data ?? [];
    const earnedBadges: EarnedBadge[] = earned.data ?? [];
    const codes: CatalogBadge[] =
      catalogBadges.length > 0
        ? catalogBadges
        : earnedBadges.map((badge) => ({
            code: badge.code,
            title: badge.title,
            icon_ref: badge.icon_ref,
          }));
    if (codes.length === 0) {
      return <StateView status="empty" message={t('reviews:reputation.noBadge')} />;
    }
    return (
      <AdaptiveGrid minTileWidth={96} gap={10}>
        {codes.map((badge) => (
          <View key={badge.code} style={earnedCodes.has(badge.code) ? undefined : styles.locked}>
            <IconTile
              icon={iconFor(badge.icon_ref)}
              label={badge.title}
              selected={earnedCodes.has(badge.code)}
              onPress={() => onOpenBadge(badge.code)}
              testID={`badge-${badge.code}`}
            />
          </View>
        ))}
      </AdaptiveGrid>
    );
  };

  const renderHistory = () => {
    const changes = reputation.data?.data.data ?? [];
    if (changes.length === 0) return null;
    return (
      <>
        <SectionHeader title={t('reviews:reputation.history')} />
        {changes.map((change) => (
          <ListItem
            key={change.id}
            label={t('reviews:reputation.change', {
              change: change.change > 0 ? `+${change.change}` : change.change,
              reason: change.reason ?? t('reviews:reputation.noReason'),
            })}
            detail={change.created_at ? formatDate(change.created_at) : undefined}
            icon={change.change >= 0 ? 'arrowUp' : 'minus'}
          />
        ))}
      </>
    );
  };

  return (
    <Screen
      title={t('reviews:reputation.title')}
      onBack={onBack}
      onRefresh={() => {
        void reputation.refetch();
        void earned.refetch();
      }}
      refreshing={reputation.isRefetching}
    >
      {reputation.isPending ? <StateView status="loading" /> : null}
      {reputation.isError ? (
        <StateView
          status="error"
          error={reputation.error}
          onRetry={() => void reputation.refetch()}
        />
      ) : null}
      {reputation.isSuccess ? (
        <>
          {renderTier()}
          <View style={styles.stats}>
            <StatTile
              label={t('reviews:reputation.earnedCount')}
              value={String(earnedCodes.size)}
              icon="badge"
            />
            <StatTile
              label={t('reviews:reputation.pointsShort')}
              value={String(total)}
              icon="star"
            />
          </View>
          <SectionHeader
            title={t('reviews:reputation.badges')}
            actionLabel={t('reviews:reputation.leaderboard')}
            onAction={onOpenLeaderboard}
          />
          {renderBadges()}
          {renderHistory()}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierTitles: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', gap: 10 },
  // Un badge non obtenu reste visible, en retrait, comme dans les maquettes.
  locked: { opacity: 0.45 },
});
