import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useRequest } from '@/features/requests';
import { useToast } from '@/shared/ui';

import { useSubmitReview } from '../hooks/useReviews';
import type { ReviewPayload } from '../schemas/reviewSchemas';
import { RatingView, type RatingValues } from '../ui/RatingView';

const POSITIVE_KEYS = ['punctual', 'careful', 'price', 'communication', 'polite', 'recommend'];
const NEGATIVE_KEYS = ['late', 'sloppy', 'expensive', 'unclear', 'unprofessional', 'tools'];

/**
 * Avis transmis au serveur, qui ne connaît ni les étiquettes ni leur catalogue : elles
 * ouvrent le commentaire afin que le choix du client ne soit pas perdu.
 */
export function toRatingPayload(requestId: string, values: RatingValues): ReviewPayload {
  const parts = [values.tags.join(' · '), values.comment.trim()].filter(Boolean);
  return { requestId, rating: values.rating, comment: parts.length > 0 ? parts.join('\n') : null };
}

export interface RatingContainerProps {
  requestId: string;
  onDone: () => void;
}

/** Notation du technicien à l'issue d'une mission. */
export function RatingContainer({ requestId, onDone }: RatingContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const request = useRequest(requestId);
  const submit = useSubmitReview();

  const send = async (values: RatingValues) => {
    try {
      await submit.mutateAsync(toRatingPayload(requestId, values));
      toast.show({ kind: 'success', title: t('reviews:form.sent') });
      onDone();
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    }
  };

  return (
    <RatingView
      technicianName={request.data?.counterpart?.name ?? ''}
      missionSummary={request.data?.title ?? ''}
      positiveTags={POSITIVE_KEYS.map((key) => t(`reviews:rate.tags.${key}`))}
      negativeTags={NEGATIVE_KEYS.map((key) => t(`reviews:rate.tags.${key}`))}
      submitting={submit.isPending}
      onBack={onDone}
      onLater={onDone}
      onSubmit={(values) => void send(values)}
    />
  );
}
