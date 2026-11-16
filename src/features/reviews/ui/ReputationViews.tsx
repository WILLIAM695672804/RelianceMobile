import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatRating } from '@/shared/format';
import {
  Avatar,
  Card,
  DetailHeader,
  Icon,
  Pill,
  Screen,
  Section,
  Text,
  type IconName,
} from '@/shared/ui';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeSummary {
  id: string;
  name: string;
  icon: IconName;
  rarity: BadgeRarity;
  description: string;
  earned: boolean;
  /** Avancement vers l'obtention, de 0 à 1. */
  progress: number;
  earnedOn?: string;
}

export interface RankStep {
  name: string;
  min: number;
}

export interface ReputationViewProps {
  name: string;
  points: number;
  ranks: readonly RankStep[];
  stats: readonly { value: string; label: string; detail: string }[];
  badges: readonly BadgeSummary[];
  onBack: () => void;
  onBadge: (badge: BadgeSummary) => void;
  onLeaderboard?: () => void;
}

function BadgeTile({ badge, onPress }: { badge: BadgeSummary; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${badge.name}, ${t(`reviews:standing.rarity.${badge.rarity}`)}${badge.earned ? '' : `, ${t('reviews:standing.locked')}`}`}
      onPress={onPress}
      style={{
        width: '31%',
        flexGrow: 1,
        alignItems: 'center',
        gap: 6,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: badge.rarity === 'common' ? theme.colors.border : theme.colors.primary,
        backgroundColor: theme.colors.surface,
        opacity: badge.earned ? 1 : 0.55,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: badge.earned ? theme.tint.primary : theme.colors.surfaceHigh,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={badge.earned ? badge.icon : 'shield'}
          size={22}
          tone={badge.earned ? 'primary' : 'muted'}
        />
      </View>
      <Text
        variant="caption"
        align="center"
        numberOfLines={2}
        style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodySemiBold }}
      >
        {badge.name}
      </Text>
    </Pressable>
  );
}

/** Rang, statistiques et badges (maquette `ReputationScreen`), présentation pure. */
export function ReputationView(props: ReputationViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentIndex = props.ranks.reduce(
    (found, rank, index) => (props.points >= rank.min ? index : found),
    0,
  );
  const current = props.ranks[currentIndex]!;
  const next = props.ranks[currentIndex + 1];
  const progress = next ? (props.points - current.min) / (next.min - current.min) : 1;
  const earned = props.badges.filter((badge) => badge.earned);
  const pending = props.badges.filter((badge) => !badge.earned);

  return (
    <Screen testID="reputation">
      <DetailHeader title={t('reviews:standing.title')} onBack={props.onBack} />
      <View style={{ padding: 20 }}>
        <View
          style={{
            borderRadius: 24,
            padding: 20,
            backgroundColor: theme.colors.primary,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={props.name} size={56} color="#ffffff" variant="striped" />
            <View style={{ flex: 1 }}>
              <Text
                variant="eyebrow"
                style={{ color: theme.colors.onPrimary, opacity: 0.8, letterSpacing: 1 }}
              >
                {t('reviews:standing.rank')}
              </Text>
              <Text variant="title" style={{ color: theme.colors.onPrimary }}>
                {current.name}
              </Text>
              <Text variant="caption" style={{ color: theme.colors.onPrimary, opacity: 0.85 }}>
                {t('reviews:standing.points', { count: props.points })}
              </Text>
            </View>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.25)',
              marginTop: 16,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.round(progress * 100)}%`,
                height: '100%',
                backgroundColor: '#ffffff',
              }}
            />
          </View>
          {next ? (
            <Text
              variant="caption"
              style={{ color: theme.colors.onPrimary, opacity: 0.85, marginTop: 8 }}
            >
              {t('reviews:standing.toNext', { count: next.min - props.points, rank: next.name })}
            </Text>
          ) : null}
        </View>
      </View>

      <Section title={t('reviews:standing.ladder')}>
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20 }}>
          {props.ranks.map((rank, index) => (
            <View key={rank.name} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  height: 6,
                  alignSelf: 'stretch',
                  borderRadius: 3,
                  backgroundColor:
                    index <= currentIndex ? theme.colors.primary : theme.colors.border,
                }}
              />
              <Text
                variant="caption"
                numberOfLines={1}
                tone={index === currentIndex ? 'primary' : 'muted'}
                style={{ fontSize: 10 }}
              >
                {rank.name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('reviews:standing.stats')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 }}>
          {props.stats.map((stat) => (
            <Card key={stat.label} padding={14} style={{ width: '47%', flexGrow: 1 }}>
              <Text variant="title">{stat.value}</Text>
              <Text variant="labelStrong">{stat.label}</Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                {stat.detail}
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      {earned.length > 0 ? (
        <Section title={t('reviews:standing.earned', { count: earned.length })}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>
            {earned.map((badge) => (
              <BadgeTile key={badge.id} badge={badge} onPress={() => props.onBadge(badge)} />
            ))}
          </View>
        </Section>
      ) : null}

      {pending.length > 0 ? (
        <Section title={t('reviews:standing.inProgress')}>
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {pending.map((badge) => (
              <Card
                key={badge.id}
                padding={14}
                onPress={() => props.onBadge(badge)}
                accessibilityLabel={badge.name}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.colors.surfaceHigh,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={badge.icon} size={18} tone="muted" />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="labelStrong">{badge.name}</Text>
                      <Text
                        variant="caption"
                        tone="muted"
                      >{`${Math.round(badge.progress * 100)} %`}</Text>
                    </View>
                    <View
                      style={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: theme.colors.border,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.round(badge.progress * 100)}%`,
                          height: '100%',
                          backgroundColor: theme.colors.primary,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      {props.onLeaderboard ? (
        <View style={{ paddingHorizontal: 20 }}>
          <Card
            padding={14}
            onPress={props.onLeaderboard}
            accessibilityLabel={t('reviews:standing.leaderboard')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon name="badge" size={20} tone="primary" />
              <Text variant="labelStrong" style={{ flex: 1 }}>
                {t('reviews:standing.leaderboard')}
              </Text>
              <Icon name="chevronR" size={16} tone="muted" />
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

export interface BadgeViewProps {
  badge: BadgeSummary;
  facts: readonly { label: string; value: string }[];
  onBack: () => void;
}

/** Détail d'un badge (maquette `BadgeDetailScreen`), présentation pure. */
export function BadgeView({ badge, facts, onBack }: BadgeViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen testID="badge">
      <DetailHeader title={t('reviews:standing.badge')} onBack={onBack} />
      <View style={{ alignItems: 'center', padding: 28, gap: 12 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: badge.earned ? theme.tint.primary : theme.colors.surfaceHigh,
            borderWidth: 3,
            borderColor: badge.earned ? theme.colors.primary : theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: badge.earned ? `0px 12px 40px ${theme.colors.primary}44` : undefined,
          }}
        >
          <Icon name={badge.icon} size={52} tone={badge.earned ? 'primary' : 'muted'} />
        </View>
        <Pill label={t(`reviews:standing.rarity.${badge.rarity}`)} tone="primary" size="sm" />
        <Text variant="headline" align="center" accessibilityRole="header">
          {badge.name}
        </Text>
        <Text variant="body" tone="muted" align="center">
          {badge.description}
        </Text>
        {!badge.earned ? (
          <Text variant="labelStrong" tone="primary">
            {t('reviews:standing.progress', { percent: Math.round(badge.progress * 100) })}
          </Text>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Card padding={0}>
          {facts.map((fact, index) => (
            <View
              key={fact.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 14,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              <Text variant="label" tone="muted">
                {fact.label}
              </Text>
              <Text variant="labelStrong">{fact.value}</Text>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

export interface LeaderEntry {
  id: string;
  name: string;
  skill: string;
  rating: number;
  reviews: number;
  isMe?: boolean;
}

export interface LeaderboardViewProps {
  area: string;
  entries: readonly LeaderEntry[];
  onBack: () => void;
  onOpen?: (entry: LeaderEntry) => void;
}

/** Classement par note reçue (maquette `LeaderboardScreen`), présentation pure. */
export function LeaderboardView({ area, entries, onBack, onOpen }: LeaderboardViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen testID="classement">
      <DetailHeader eyebrow={area} title={t('reviews:standing.leaderboard')} onBack={onBack} />
      <View style={{ padding: 20, gap: 8 }}>
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            padding={14}
            onPress={onOpen ? () => onOpen(entry) : undefined}
            accessibilityLabel={`${index + 1}. ${entry.name}`}
            style={entry.isMe ? { borderColor: theme.colors.primary, borderWidth: 1.5 } : undefined}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text
                variant="title"
                tone={index < 3 ? 'primary' : 'muted'}
                style={{ width: 28, textAlign: 'center' }}
              >
                {String(index + 1)}
              </Text>
              <Avatar name={entry.name} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="labelStrong" numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                  {entry.skill}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="star" size={13} tone="warning" />
                  <Text variant="labelStrong">{formatRating(entry.rating)}</Text>
                </View>
                <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                  {t('reviews:standing.reviews', { count: entry.reviews })}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
