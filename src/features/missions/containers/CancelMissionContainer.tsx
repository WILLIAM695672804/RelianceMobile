import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { QueryGate, useToast } from '@/shared/ui';

import { useJob, useUpdateJobStatus } from '../hooks/useMissions';
import { CancelView } from '../ui/CompletionViews';

/** Motifs d'annulation du technicien, transmis en note de clôture. */
export const TECH_CANCEL_REASONS = ['unavailable', 'client', 'delay', 'other'] as const;

export interface CancelMissionContainerProps {
  jobId: string;
  onBack: () => void;
  onDone: () => void;
}

/**
 * Annulation d'une mission par le technicien assigné, seul habilité par le serveur
 * (`PATCH /jobs/{id}/status`) ; le séquestre revient alors au client.
 */
export function CancelMissionContainer({ jobId, onBack, onDone }: CancelMissionContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const job = useJob(jobId);
  const update = useUpdateJobStatus(jobId);

  const confirm = async (reason: string) => {
    try {
      await update.mutateAsync({
        status: 'cancelled',
        completionNotes: t(`missions:cancel.reasons.${reason}`),
      });
      onDone();
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    }
  };

  return (
    <QueryGate queries={[job]}>
      {() => (
        <CancelView
          viewer="technician"
          technician={{
            name: job.data?.request?.title ?? '',
            detail: `#${(job.data?.request_id ?? jobId).slice(0, 8).toUpperCase()}`,
            statusLabel: t(`missions:status.${job.data?.status ?? 'unknown'}`),
          }}
          reasons={TECH_CANCEL_REASONS.map((key) => ({
            key,
            label: t(`missions:cancel.reasons.${key}`),
          }))}
          refund={null}
          submitting={update.isPending}
          onBack={onBack}
          onConfirm={(reason) => void confirm(reason)}
        />
      )}
    </QueryGate>
  );
}
