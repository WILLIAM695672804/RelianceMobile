import { useTranslation } from 'react-i18next';

import { rankTechnicians, useTechnicianDirectory } from '@/features/directory';
import { useTechnicianStats } from '@/features/profile';
import {
  BadgeView,
  LeaderboardView,
  REPUTATION_TIERS,
  ReputationView,
  TIER_THRESHOLDS,
  useBadgeCatalog,
  useReputation,
  useUserBadges,
  type BadgeSummary,
  type CatalogBadge,
  type LeaderEntry,
} from '@/features/reviews';
import { formatDate, formatRating } from '@/shared/format';
import { QueryGate, type IconName } from '@/shared/ui';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Icône d'un badge : le serveur renvoie un nom libre, rapproché du jeu d'icônes. */
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

/**
 * Badges du catalogue, marqués obtenus d'après les attributions. Le serveur ne publie ni
 * rareté ni avancement : tous sont « standard », un badge non obtenu est à 0 %.
 */
export function toBadgeSummaries(
  catalog: readonly CatalogBadge[],
  earned: readonly {
    code: string;
    title: string;
    icon_ref?: string | null;
    awarded_at?: string | null;
  }[],
): BadgeSummary[] {
  const awarded = new Map(earned.map((badge) => [badge.code, badge]));
  const source: CatalogBadge[] =
    catalog.length > 0
      ? [...catalog]
      : earned.map((badge) => ({ code: badge.code, title: badge.title, icon_ref: badge.icon_ref }));
  return source.map((badge) => {
    const mine = awarded.get(badge.code);
    return {
      id: badge.code,
      name: badge.title,
      icon: (badge.icon_ref && BADGE_ICONS[badge.icon_ref]) || 'badge',
      rarity: 'common',
      description: badge.description ?? '',
      earned: Boolean(mine),
      progress: mine ? 1 : 0,
      earnedOn: mine?.awarded_at ? formatDate(mine.awarded_at) : undefined,
    };
  });
}

function ranks(t: Translate) {
  return REPUTATION_TIERS.map((tier) => ({
    name: t(`reviews:reputation.tiers.${tier}`),
    min: TIER_THRESHOLDS[tier],
  }));
}

export interface ReputationContainerProps {
  userId: string;
  name: string;
  onBack: () => void;
  onBadge: (code: string) => void;
  onLeaderboard: () => void;
}

/** Réputation du technicien : rang, statistiques réelles, badges obtenus et à conquérir. */
export function ReputationContainer(props: ReputationContainerProps) {
  const { t } = useTranslation();
  const reputation = useReputation(props.userId);
  const earned = useUserBadges(props.userId);
  const catalog = useBadgeCatalog();
  const stats = useTechnicianStats();

  return (
    <QueryGate queries={[reputation]}>
      {() => {
        const data = stats.data;
        return (
          <ReputationView
            name={props.name}
            points={Math.max(0, reputation.data?.total ?? 0)}
            ranks={ranks(t)}
            stats={[
              {
                value: data?.rating != null ? formatRating(data.rating) : '—',
                label: t('reviews:standingStats.rating'),
                detail: t('reviews:standing.reviews', { count: data?.num_reviews ?? 0 }),
              },
              {
                value: String(data?.missions_completed ?? 0),
                label: t('reviews:standingStats.missions'),
                detail: t('reviews:standingStats.missionsDetail', {
                  count: data?.missions_total ?? 0,
                }),
              },
              {
                value:
                  data?.completion_rate != null ? `${Math.round(data.completion_rate)} %` : '—',
                label: t('reviews:standingStats.completion'),
                detail: t('reviews:standingStats.completionDetail'),
              },
            ]}
            badges={toBadgeSummaries(catalog.data ?? [], earned.data ?? [])}
            onBack={props.onBack}
            onBadge={(badge) => props.onBadge(badge.id)}
            onLeaderboard={props.onLeaderboard}
          />
        );
      }}
    </QueryGate>
  );
}

export interface BadgeContainerProps {
  code: string;
  userId: string;
  onBack: () => void;
}

/** Détail d'un badge du catalogue, avec sa date d'obtention le cas échéant. */
export function BadgeContainer({ code, userId, onBack }: BadgeContainerProps) {
  const { t } = useTranslation();
  const catalog = useBadgeCatalog();
  const earned = useUserBadges(userId);

  return (
    <QueryGate queries={[catalog]}>
      {() => {
        const badge = toBadgeSummaries(catalog.data ?? [], earned.data ?? []).find(
          (entry) => entry.id === code,
        );
        const fallback: BadgeSummary = {
          id: code,
          name: code,
          icon: 'badge',
          rarity: 'common',
          description: '',
          earned: false,
          progress: 0,
        };
        const shown = badge ?? fallback;
        return (
          <BadgeView
            badge={shown}
            facts={[
              {
                label: t('reviews:standingStats.status'),
                value: t(shown.earned ? 'reviews:standingStats.earned' : 'reviews:standing.locked'),
              },
              ...(shown.earnedOn
                ? [{ label: t('reviews:standingStats.earnedOn'), value: shown.earnedOn }]
                : []),
            ]}
            onBack={onBack}
          />
        );
      }}
    </QueryGate>
  );
}

export interface LeaderboardContainerProps {
  selfId: string | null;
  onBack: () => void;
  onOpen: (technicianId: string) => void;
}

/** Classement des techniciens : note reçue, puis nombre d'avis (aucun palmarès serveur). */
export function LeaderboardContainer({ selfId, onBack, onOpen }: LeaderboardContainerProps) {
  const { t } = useTranslation();
  const directory = useTechnicianDirectory({ search: '', coordinates: null });

  return (
    <QueryGate queries={[directory]}>
      {() => {
        const entries: LeaderEntry[] = rankTechnicians(directory.data?.technicians ?? []).map(
          ({ technician }) => ({
            id: technician.id,
            name: technician.name,
            skill: technician.skills[0]?.category ?? technician.skills[0]?.name ?? '',
            rating: technician.rating ?? 0,
            reviews: technician.num_reviews ?? 0,
            isMe: technician.id === selfId,
          }),
        );
        return (
          <LeaderboardView
            area={t('reviews:standingStats.area')}
            entries={entries}
            onBack={onBack}
            onOpen={(entry) => onOpen(entry.id)}
          />
        );
      }}
    </QueryGate>
  );
}
