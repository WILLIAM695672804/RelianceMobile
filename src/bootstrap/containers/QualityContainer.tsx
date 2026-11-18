import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStorageUrl } from '@/core/api';
import { describeError, normalizeError } from '@/core/errors';
import { interventionForRequest, useInterventions } from '@/features/interventions';
import { MissionClosedView, ValidationView, type WorkCheck } from '@/features/missions';
import { useRequest } from '@/features/requests';
import { holdForRequest, useCaptureHold, useHolds } from '@/features/wallet';
import { formatDate } from '@/shared/format';
import { QueryGate, useToast } from '@/shared/ui';

/** Méthode de versement au technicien ; le serveur l'exige sans la vérifier. */
const PAYOUT_METHOD = 'momo';

const CHECK_KEYS = ['work', 'tested', 'clean'] as const;

/** Photos « avant / après » : la première et la dernière de la demande, s'il y en a deux. */
export function beforeAfter(photos: readonly string[]): { before: string; after: string } | null {
  return photos.length >= 2 ? { before: photos[0]!, after: photos[photos.length - 1]! } : null;
}

export interface QualityContainerProps {
  requestId: string;
  technicianId: string;
  onBack: () => void;
  onDispute: (requestId: string, against: string) => void;
  onRate: (requestId: string) => void;
  onInvoices: () => void;
  onHome: () => void;
}

/**
 * Validation des travaux : le client coche ses vérifications puis libère le séquestre au
 * profit du technicien ; la mission close propose la notation et la facture.
 */
export function QualityContainer(props: QualityContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const storageUrl = useStorageUrl();
  const request = useRequest(props.requestId);
  const interventions = useInterventions();
  const holds = useHolds();
  const hold = holds.data ? holdForRequest(holds.data, props.requestId) : null;
  const capture = useCaptureHold(hold?.id ?? '');
  const [released, setReleased] = useState<number | null>(null);

  const report = interventionForRequest(interventions.data ?? [], props.requestId);
  const technicianName = report?.technician?.name ?? '';

  const validate = async () => {
    if (!hold) {
      toast.show({ kind: 'warning', title: t('missions:quality.noHold') });
      return;
    }
    try {
      await capture.mutateAsync({ payeeId: props.technicianId, method: PAYOUT_METHOD });
      setReleased(hold.amount);
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    }
  };

  if (released !== null) {
    return (
      <MissionClosedView
        technicianName={technicianName}
        reference={`#${props.requestId.slice(0, 8).toUpperCase()}`}
        summary={request.data?.title ?? ''}
        amount={released}
        onRate={() => props.onRate(props.requestId)}
        onInvoice={props.onInvoices}
        onHome={props.onHome}
      />
    );
  }

  return (
    <QueryGate queries={[request, interventions, holds]}>
      {() => {
        const photos = beforeAfter((request.data?.photos ?? []).map(storageUrl));
        const checks: WorkCheck[] = CHECK_KEYS.map((key) => ({
          key,
          label: t(`missions:completion.checkItems.${key}`),
        }));
        const finished = report?.completed_at ?? null;
        return (
          <ValidationView
            technicianName={technicianName}
            phaseLabel={request.data?.title ?? ''}
            finishedAt={finished ? formatDate(finished) : ''}
            photos={photos}
            checks={checks}
            releaseAmount={hold?.amount ?? 0}
            submitting={capture.isPending}
            onBack={props.onBack}
            onValidate={() => void validate()}
            onDispute={() => props.onDispute(props.requestId, props.technicianId)}
          />
        );
      }}
    </QueryGate>
  );
}
