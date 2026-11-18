import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatAmount, formatRating } from '@/shared/format';
import { Avatar, Card, ListRow, Pill, SectionLabel, Stars, Text } from '@/shared/ui';

import type { TechnicianProfile } from '../schemas/matchingSchemas';

/** Avis affichés au plus. */
const LISTED_REVIEWS = 3;

/** Profil public d'un technicien : identité, note, zone, présentation, compétences et avis. */
export function TechnicianProfileSummary({ profile }: { profile: TechnicianProfile }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={profile.name} uri={profile.avatar_url} size={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title" accessibilityRole="header">
            {profile.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {profile.verified ? (
              <Pill label={t('matching:results.verified')} tone="success" size="sm" icon="check" />
            ) : null}
            {profile.rating != null ? (
              <Text variant="caption" tone="muted">
                {t('matching:results.rating', {
                  rating: formatRating(profile.rating),
                  count: profile.num_reviews ?? 0,
                })}
              </Text>
            ) : null}
          </View>
          {profile.service_perimeter?.city ? (
            <Text variant="caption" tone="muted">
              {t('matching:offer.perimeter', { city: profile.service_perimeter.city })}
            </Text>
          ) : null}
        </View>
      </View>

      {profile.bio ? (
        <View>
          <SectionLabel label={t('matching:offer.about')} />
          <Text>{profile.bio}</Text>
        </View>
      ) : null}

      {profile.skills.length > 0 ? (
        <View>
          <SectionLabel label={t('matching:offer.skills')} />
          <Card padding={0}>
            {profile.skills.map((skill, index) => (
              <ListRow
                key={skill.id}
                icon="wrench"
                divider={index > 0}
                title={skill.name}
                detail={
                  skill.hourly_rate != null
                    ? t('matching:offer.hourlyRate', { amount: formatAmount(skill.hourly_rate) })
                    : undefined
                }
              />
            ))}
          </Card>
        </View>
      ) : null}

      <View>
        <SectionLabel label={t('matching:offer.reviews')} />
        {profile.recent_reviews.length === 0 ? (
          <Text variant="label" tone="muted">
            {t('matching:offer.noReviews')}
          </Text>
        ) : (
          <View style={{ gap: 8 }}>
            {profile.recent_reviews.slice(0, LISTED_REVIEWS).map((review) => (
              <Card key={String(review.id)} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                    {t('matching:offer.review', {
                      rating: formatRating(review.rating),
                      author: review.reviewer?.name ?? t('matching:offer.anonymous'),
                    })}
                  </Text>
                  <Stars value={review.rating} />
                </View>
                {review.comment ? <Text style={{ marginTop: 6 }}>{review.comment}</Text> : null}
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
