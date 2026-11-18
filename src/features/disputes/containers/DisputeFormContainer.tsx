import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useRequest } from '@/features/requests';
import { holdForRequest, useHolds } from '@/features/wallet';
import type { IconName } from '@/shared/ui';

import { useOpenDispute } from '../hooks/useDisputes';
import { disputeFormSchema, DISPUTE_REASONS, type DisputeReason } from '../schemas/disputeSchemas';
import { DisputeView, type DisputeReasonOption, type DisputeValues } from '../ui/DisputeView';

const REASON_ICONS: Record<DisputeReason, IconName> = {
  work_not_done: 'wrench',
  quality: 'info',
  delay: 'clock',
  amount: 'wallet',
  behaviour: 'user',
  other: 'info',
};

export interface DisputeFormContainerProps {
  requestId: string;
  /** Partie mise en cause. */
  against: string;
  onBack: () => void;
  onOpened: (disputeId: string) => void;
}

/** Ouverture d'un litige : motif et description, le séquestre restant gelé. */
export function DisputeFormContainer(props: DisputeFormContainerProps) {
  const { t } = useTranslation();
  const request = useRequest(props.requestId);
  const holds = useHolds();
  const open = useOpenDispute();
  const [formError, setFormError] = useState<string | null>(null);
  const hold = holds.data ? holdForRequest(holds.data, props.requestId) : null;

  const reasons: DisputeReasonOption[] = DISPUTE_REASONS.map((key) => ({
    key,
    icon: REASON_ICONS[key],
    label: t(`disputes:reasons.${key}`),
    hint: t(`disputes:reasonHints.${key}`),
  }));

  const submit = async (values: DisputeValues) => {
    const parsed = disputeFormSchema.safeParse({
      reason: values.reason,
      description: values.details,
    });
    if (!parsed.success) {
      setFormError(t(parsed.error.issues[0]!.message));
      return;
    }
    setFormError(null);
    try {
      const dispute = await open.mutateAsync({
        requestId: props.requestId,
        against: props.against,
        reason: parsed.data.reason,
        description: parsed.data.description,
      });
      props.onOpened(dispute.id);
    } catch (error) {
      setFormError(describeError(normalizeError(error), t));
    }
  };

  return (
    <DisputeView
      mission={{
        technicianName: request.data?.counterpart?.name ?? '',
        detail: request.data?.title ?? '',
        reference: `#${props.requestId.slice(0, 8).toUpperCase()}`,
        held: hold?.amount ?? null,
      }}
      reasons={reasons}
      submitting={open.isPending}
      formError={formError}
      onCancel={props.onBack}
      onSubmit={(values) => void submit(values)}
    />
  );
}
