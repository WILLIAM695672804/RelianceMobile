import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  InterventionReportScreen,
  interventionForJob,
  interventionForRequest,
  useCreateIntervention,
  useInterventions,
} from '@/features/interventions';
import { Screen, StateView } from '@/shared/components';

export interface InterventionReportGateProps {
  /** Mission du technicien : l'intervention est ouverte si elle n'existe pas encore. */
  jobId?: string;
  /** Demande du client : l'intervention est seulement consultée. */
  requestId?: string;
  mode: 'read' | 'edit';
  onBack?: () => void;
  onDone?: () => void;
}

/**
 * Résout l'intervention d'une mission avant d'ouvrir son rapport. Le serveur ne publie
 * l'identifiant d'intervention nulle part ailleurs : il est retrouvé dans la liste, que
 * l'API restreint aux interventions de la personne connectée.
 */
export function InterventionReportGate({
  jobId,
  requestId,
  mode,
  onBack,
  onDone,
}: InterventionReportGateProps) {
  const { t } = useTranslation();
  const interventions = useInterventions();
  const create = useCreateIntervention();
  const found =
    interventions.data === undefined
      ? null
      : jobId !== undefined
        ? interventionForJob(interventions.data, jobId)
        : requestId !== undefined
          ? interventionForRequest(interventions.data, requestId)
          : null;

  const missing = interventions.isSuccess && found === null;
  const canOpen = mode === 'edit' && jobId !== undefined && requestId !== undefined;

  useEffect(() => {
    if (missing && canOpen && create.isIdle) {
      create.mutate({ jobId: jobId!, requestId: requestId! });
    }
  }, [missing, canOpen, create, jobId, requestId]);

  if (interventions.isPending || (missing && canOpen)) {
    return (
      <Screen title={t('interventions:report.title')} onBack={onBack}>
        <StateView status="loading" />
      </Screen>
    );
  }
  if (interventions.isError) {
    return (
      <Screen title={t('interventions:report.title')} onBack={onBack}>
        <StateView
          status="error"
          error={interventions.error}
          onRetry={() => void interventions.refetch()}
        />
      </Screen>
    );
  }
  if (found === null) {
    return (
      <Screen title={t('interventions:report.readTitle')} onBack={onBack}>
        <StateView status="empty" message={t('interventions:report.noReport')} />
      </Screen>
    );
  }

  return (
    <InterventionReportScreen
      interventionId={found.id}
      mode={mode}
      onBack={onBack}
      onDone={onDone}
    />
  );
}
