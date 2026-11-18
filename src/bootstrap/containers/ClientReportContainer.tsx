import { useTranslation } from 'react-i18next';

import {
  interventionForRequest,
  useInterventions,
  type Intervention,
} from '@/features/interventions';
import { DiagnosticView, type DiagnosticReport } from '@/features/requests';
import { formatDate } from '@/shared/format';
import { BackButton, EmptyState, QueryGate, Screen } from '@/shared/ui';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Rapport d'intervention du serveur présenté dans la maquette du diagnostic : travaux
 * réalisés en constat, notes et matériel employé en recommandations. Le serveur ne chiffre
 * pas le rapport : l'estimation n'est pas affichée.
 */
export function toDiagnosticReport(
  intervention: Intervention,
  requestId: string,
  t: Translate,
): DiagnosticReport {
  const notes = (intervention.notes ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const materials = intervention.materials_used ?? [];
  const when = intervention.completed_at ?? intervention.started_at ?? intervention.scheduled_at;
  return {
    reference: `#${requestId.slice(0, 8).toUpperCase()}`,
    phaseLabel: t(`interventions:report.statuses.${intervention.status}`),
    technician: { name: intervention.technician?.name ?? '' },
    performedAt: when ? formatDate(when) : '',
    findings: intervention.work_performed ?? t('interventions:report.noReport'),
    photos: [],
    recommendations:
      materials.length > 0
        ? [...notes, t('interventions:report.materialsLine', { list: materials.join(', ') })]
        : notes,
    lines: [],
    diagnosticFee: null,
  };
}

export interface ClientReportContainerProps {
  requestId: string;
  onBack: () => void;
  onAskQuote: () => void;
}

/** Rapport d'intervention consulté par le client, menant aux devis. */
export function ClientReportContainer({
  requestId,
  onBack,
  onAskQuote,
}: ClientReportContainerProps) {
  const { t } = useTranslation();
  const interventions = useInterventions();

  return (
    <QueryGate queries={[interventions]}>
      {() => {
        const found = interventionForRequest(interventions.data ?? [], requestId);
        if (!found) {
          return (
            <Screen testID="rapport-absent">
              <BackButton onPress={onBack} />
              <EmptyState
                icon="file"
                title={t('interventions:report.readTitle')}
                message={t('interventions:report.noReport')}
              />
            </Screen>
          );
        }
        return (
          <DiagnosticView
            mode="client"
            report={toDiagnosticReport(found, requestId, t)}
            onBack={onBack}
            onPrimary={onAskQuote}
          />
        );
      }}
    </QueryGate>
  );
}
