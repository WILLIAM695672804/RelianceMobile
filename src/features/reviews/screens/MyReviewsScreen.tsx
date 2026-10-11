import { useTranslation } from 'react-i18next';

import { useSession } from '@/core/session';
import { Badge, Card, Screen, StateView, Text } from '@/shared/components';
import { formatDate, formatRating } from '@/shared/format';

import { useMyReviews, useReputation, useUserBadges } from '../hooks/useReviews';

/** Avis reçus par le technicien connecté, avec sa réputation et ses badges. */
export function MyReviewsScreen() {
  const { t } = useTranslation();
  const userId = useSession((state) => state.user?.id ?? '');
  const reviews = useMyReviews();
  const reputation = useReputation(userId);
  const badges = useUserBadges(userId);

  const refresh = () => {
    void reviews.refetch();
    void reputation.refetch();
    void badges.refetch();
  };

  const renderReviews = () => {
    if (reviews.isPending) return <StateView status="loading" />;
    if (reviews.isError) {
      return (
        <StateView status="error" error={reviews.error} onRetry={() => void reviews.refetch()} />
      );
    }
    if (reviews.data.length === 0) {
      return <StateView status="empty" message={t('reviews:mine.empty')} />;
    }
    return reviews.data.map((review) => (
      <Card key={review.id}>
        <Text variant="subtitle">
          {t('reviews:mine.rating', { rating: formatRating(review.rating) })}
        </Text>
        <Text tone="muted">
          {t('reviews:mine.author', {
            name: review.reviewer?.name ?? t('reviews:mine.anonymous'),
          })}
        </Text>
        {review.request ? (
          <Text tone="muted">{t('reviews:mine.request', { title: review.request.title })}</Text>
        ) : null}
        {review.comment ? <Text>{review.comment}</Text> : null}
        {review.created_at ? (
          <Text variant="caption" tone="muted">
            {t('reviews:mine.receivedAt', { date: formatDate(review.created_at) })}
          </Text>
        ) : null}
      </Card>
    ));
  };

  return (
    <Screen title={t('reviews:mine.title')} onRefresh={refresh} refreshing={reviews.isRefetching}>
      {reputation.isSuccess ? (
        <Card>
          <Text variant="subtitle">
            {t('reviews:mine.reputation', { total: reputation.data.total })}
          </Text>
          {reputation.data.data.data.map((change) => (
            <Text key={change.id} variant="caption" tone="muted">
              {t('reviews:mine.reputationChange', {
                change: change.change,
                reason: change.reason ?? '',
              })}
            </Text>
          ))}
        </Card>
      ) : null}
      <Text variant="subtitle">{t('reviews:mine.badges')}</Text>
      {badges.isSuccess ? (
        badges.data.length === 0 ? (
          <Text tone="muted">{t('reviews:mine.noBadges')}</Text>
        ) : (
          badges.data.map((badge) => <Badge key={badge.code} label={badge.title} tone="success" />)
        )
      ) : null}
      {renderReviews()}
    </Screen>
  );
}
