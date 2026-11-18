import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSession } from '@/core/session';
import { useTheme } from '@/core/theme';
import { formatDate, formatRating } from '@/shared/format';
import {
  Avatar,
  Card,
  EmptyState,
  Pill,
  QueryGate,
  Screen,
  Section,
  Stars,
  Text,
  TopBar,
} from '@/shared/ui';

import { useMyReviews, useReputation, useUserBadges } from '../hooks/useReviews';

export interface MyReviewsScreenProps {
  onBack?: () => void;
}

/** Avis reçus par le technicien connecté, avec sa réputation et ses badges. */
export function MyReviewsScreen({ onBack }: MyReviewsScreenProps = {}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const userId = useSession((state) => state.user?.id ?? '');
  const reviews = useMyReviews();
  const reputation = useReputation(userId);
  const badges = useUserBadges(userId);

  const refresh = () => {
    void reviews.refetch();
    void reputation.refetch();
    void badges.refetch();
  };

  return (
    <Screen testID="mes-avis" onRefresh={refresh} refreshing={reviews.isRefetching}>
      <TopBar title={t('reviews:mine.title')} onBack={onBack} />
      {reputation.isSuccess ? (
        <View style={{ paddingHorizontal: 20 }}>
          <Card
            padding={16}
            style={{ backgroundColor: theme.tint.primary, borderColor: 'transparent' }}
          >
            <Text variant="section">
              {t('reviews:mine.reputation', { total: reputation.data.total })}
            </Text>
            {reputation.data.data.data.map((change) => (
              <Text key={change.id} variant="caption" tone="muted" style={{ marginTop: 4 }}>
                {t('reviews:mine.reputationChange', {
                  change: change.change,
                  // Le serveur suffixe la référence de l'avis (« Review #<uuid>: 5 etoiles »).
                  reason: (change.reason ?? '').replace(/#[0-9a-f-]{8,}:?\s*/i, ''),
                })}
              </Text>
            ))}
          </Card>
        </View>
      ) : null}

      <Section title={t('reviews:mine.badges')}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {badges.isSuccess ? (
            badges.data.length === 0 ? (
              <Text variant="label" tone="muted">
                {t('reviews:mine.noBadges')}
              </Text>
            ) : (
              badges.data.map((badge) => (
                <Pill key={badge.code} label={badge.title} tone="success" icon="badge" />
              ))
            )
          ) : null}
        </View>
      </Section>

      <Section title={t('reviews:mine.title')}>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <QueryGate queries={[reviews]}>
            {() =>
              (reviews.data ?? []).length === 0 ? (
                <EmptyState
                  icon="star"
                  title={t('reviews:mine.title')}
                  message={t('reviews:mine.empty')}
                />
              ) : (
                <>
                  {reviews.data!.map((review) => {
                    const author = review.reviewer?.name ?? t('reviews:mine.anonymous');
                    return (
                      <Card key={review.id} padding={16}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Avatar name={author} size={36} />
                          <View style={{ flex: 1 }}>
                            <Text variant="labelStrong">
                              {t('reviews:mine.author', { name: author })}
                            </Text>
                            {review.created_at ? (
                              <Text variant="caption" tone="muted">
                                {t('reviews:mine.receivedAt', {
                                  date: formatDate(review.created_at),
                                })}
                              </Text>
                            ) : null}
                          </View>
                          <Stars value={review.rating} size={12} />
                        </View>
                        <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
                          {t('reviews:mine.rating', { rating: formatRating(review.rating) })}
                          {review.request
                            ? ` · ${t('reviews:mine.request', { title: review.request.title })}`
                            : ''}
                        </Text>
                        {review.comment ? (
                          <Text style={{ marginTop: 6 }}>{review.comment}</Text>
                        ) : null}
                      </Card>
                    );
                  })}
                </>
              )
            }
          </QueryGate>
        </View>
      </Section>
    </Screen>
  );
}
