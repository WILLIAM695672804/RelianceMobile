import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Badge, Card, ListItem, Text } from '@/shared/components';
import { formatAmount, formatRating } from '@/shared/format';

import type { TechnicianProfile } from '../schemas/matchingSchemas';

/** Avis affichés au plus. */
const LISTED_REVIEWS = 3;

/** Profil public d'un technicien : identité, note, zone, présentation, compétences et avis. */
export function TechnicianProfileSummary({ profile }: { profile: TechnicianProfile }) {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.header}>
        <Avatar name={profile.name} uri={profile.avatar_url} size={72} />
        <View style={styles.identity}>
          <Text variant="title" accessibilityRole="header">
            {profile.name}
          </Text>
          {profile.verified ? (
            <Badge label={t('matching:results.verified')} tone="success" />
          ) : null}
        </View>
      </View>
      {profile.rating != null ? (
        <Text tone="muted">
          {t('matching:results.rating', {
            rating: formatRating(profile.rating),
            count: profile.num_reviews ?? 0,
          })}
        </Text>
      ) : null}
      {profile.service_perimeter?.city ? (
        <Text tone="muted">
          {t('matching:offer.perimeter', { city: profile.service_perimeter.city })}
        </Text>
      ) : null}
      {profile.bio ? (
        <>
          <Text variant="subtitle">{t('matching:offer.about')}</Text>
          <Text>{profile.bio}</Text>
        </>
      ) : null}
      {profile.skills.length > 0 ? (
        <>
          <Text variant="subtitle">{t('matching:offer.skills')}</Text>
          {profile.skills.map((skill) => (
            <ListItem
              key={skill.id}
              label={skill.name}
              detail={
                skill.hourly_rate != null
                  ? t('matching:offer.hourlyRate', { amount: formatAmount(skill.hourly_rate) })
                  : undefined
              }
            />
          ))}
        </>
      ) : null}
      <Text variant="subtitle">{t('matching:offer.reviews')}</Text>
      {profile.recent_reviews.length === 0 ? (
        <Text tone="muted">{t('matching:offer.noReviews')}</Text>
      ) : (
        profile.recent_reviews.slice(0, LISTED_REVIEWS).map((review) => (
          <Card key={String(review.id)}>
            <Text variant="caption" tone="muted">
              {t('matching:offer.review', {
                rating: formatRating(review.rating),
                author: review.reviewer?.name ?? t('matching:offer.anonymous'),
              })}
            </Text>
            {review.comment ? <Text>{review.comment}</Text> : null}
          </Card>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identity: { flex: 1, gap: 4 },
});
