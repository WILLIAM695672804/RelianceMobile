import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import {
  Avatar,
  Button,
  ChoiceChip,
  Field,
  Screen,
  Text,
  TextAction,
  BackButton,
} from '@/shared/ui';

/** Longueur maximale du commentaire, alignée sur la validation du serveur. */
export const COMMENT_MAX_LENGTH = 500;

export interface RatingValues {
  rating: number;
  tags: string[];
  comment: string;
}

export interface RatingViewProps {
  technicianName: string;
  missionSummary: string;
  positiveTags: readonly string[];
  negativeTags: readonly string[];
  submitting?: boolean;
  onBack: () => void;
  onLater?: () => void;
  onSubmit: (values: RatingValues) => void;
}

const STAR_PATH = 'M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 17.8 5.6 21.7l1.7-7.3L1.6 9.5l7.5-.6z';

/** Notation après mission (maquette `RatingScreen`), présentation pure. */
export function RatingView(props: RatingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const negative = rating > 0 && rating <= 2;
  const positive = rating >= 4;
  const tone = negative
    ? theme.colors.danger
    : positive
      ? theme.colors.success
      : theme.colors.warning;
  const tagSet = negative ? props.negativeTags : props.positiveTags;

  const choose = (value: number) => {
    const wasNegative = rating > 0 && rating <= 2;
    setRating(value);
    if (wasNegative !== value <= 2) setTags([]);
  };

  return (
    <Screen
      testID="notation"
      footer={
        <Button
          label={t('reviews:rate.submit')}
          size="lg"
          full
          disabled={rating === 0}
          loading={props.submitting}
          onPress={() => props.onSubmit({ rating, tags, comment: comment.trim() })}
        />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <BackButton onPress={props.onBack} />
        {props.onLater ? (
          <TextAction label={t('reviews:rate.later')} onPress={props.onLater} tone="muted" />
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Avatar name={props.technicianName} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
              {t('reviews:rate.done')}
            </Text>
            <Text variant="bodyStrong" style={{ fontSize: 16 }}>
              {props.technicianName}
            </Text>
            <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
              {props.missionSummary}
            </Text>
          </View>
        </View>

        <Text variant="title" align="center" accessibilityRole="header" style={{ marginTop: 6 }}>
          {t('reviews:rate.question')}
        </Text>
        <Text
          variant="label"
          tone="muted"
          align="center"
          style={{ fontFamily: theme.fontFamily.body }}
        >
          {t('reviews:rate.why')}
        </Text>

        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= rating;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected: value === rating }}
                accessibilityLabel={t('reviews:rate.star', { count: value })}
                onPress={() => choose(value)}
                style={{
                  width: MIN_TOUCH_TARGET,
                  height: MIN_TOUCH_TARGET + 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={44} height={44} viewBox="0 0 24 24">
                  <Path
                    d={STAR_PATH}
                    fill={active ? tone : 'none'}
                    stroke={active ? tone : theme.colors.outlineVariant}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            );
          })}
        </View>
        <View accessibilityLiveRegion="polite">
          <Text
            variant="bodyStrong"
            align="center"
            style={{ color: rating ? tone : theme.colors.textMuted }}
          >
            {t(rating ? `reviews:rate.labels.${rating}` : 'reviews:rate.tap')}
          </Text>
        </View>

        {rating > 0 ? (
          <>
            <Text variant="labelStrong" style={{ marginTop: 6 }}>
              {t(negative ? 'reviews:rate.whatWrong' : 'reviews:rate.whatGood')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {tagSet.map((tag) => (
                <ChoiceChip
                  key={tag}
                  label={tag}
                  selected={tags.includes(tag)}
                  onPress={() =>
                    setTags((current) =>
                      current.includes(tag)
                        ? current.filter((entry) => entry !== tag)
                        : [...current, tag],
                    )
                  }
                />
              ))}
            </View>
            <Field
              label={t('reviews:rate.comment')}
              value={comment}
              onChangeText={setComment}
              placeholder={t('reviews:rate.commentPlaceholder')}
              multiline
              maxLength={COMMENT_MAX_LENGTH}
              hint={`${comment.length} / ${COMMENT_MAX_LENGTH}`}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}
