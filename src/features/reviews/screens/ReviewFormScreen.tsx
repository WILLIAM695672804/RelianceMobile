import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { useSubmitReview } from '../hooks/useReviews';
import { RATING_VALUES, reviewFormSchema, toReviewPayload } from '../schemas/reviewSchemas';

export interface ReviewFormScreenProps {
  requestId: string;
  /** Avis déposé : retour au détail de la demande. */
  onDone: () => void;
}

/** Dépôt d'un avis à l'issue d'une intervention clôturée. */
export function ReviewFormScreen({ requestId, onDone }: ReviewFormScreenProps) {
  const { t } = useTranslation();
  const submit = useSubmitReview();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '' },
  });
  const rating = useWatch({ control: form.control, name: 'rating' });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setNotice(null);
    try {
      await submit.mutateAsync(toReviewPayload(requestId, values));
      setNotice(t('reviews:form.sent'));
      onDone();
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  });

  const ratingError = form.formState.errors.rating?.message;

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('reviews:form.title')}
      </Text>
      <Text tone="muted">{t('reviews:form.hint')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <Text variant="caption" tone="muted">
        {t('reviews:form.rating')}
      </Text>
      <View style={styles.ratings}>
        {RATING_VALUES.map((value) => (
          <Button
            key={value}
            label={String(value)}
            accessibilityLabel={t('reviews:form.rate', { value })}
            onPress={() => form.setValue('rating', value, { shouldValidate: true })}
            variant={rating === value ? 'primary' : 'ghost'}
          />
        ))}
      </View>
      {rating > 0 ? (
        <Text tone="primary">{t('reviews:form.selected', { value: rating })}</Text>
      ) : null}
      {ratingError ? <Text tone="danger">{t(ratingError)}</Text> : null}
      <FormTextField
        control={form.control}
        name="comment"
        label={t('reviews:form.comment')}
        multiline
      />
      <Button
        label={t('reviews:form.submit')}
        onPress={() => void onSubmit()}
        loading={submit.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ratings: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
