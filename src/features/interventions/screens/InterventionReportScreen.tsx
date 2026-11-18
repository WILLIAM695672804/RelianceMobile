import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  SectionLabel,
  Text,
  TopBar,
  type PillTone,
} from '@/shared/ui';
import { formatDate, formatHours } from '@/shared/format';

import { useCompleteIntervention, useIntervention } from '../hooks/useInterventions';
import {
  reportFormSchema,
  toReportPayload,
  type Intervention,
  type InterventionStatus,
  type ReportFormValues,
} from '../schemas/interventionSchemas';

const TONE_BY_STATUS: Record<InterventionStatus, PillTone> = {
  planned: 'neutral',
  in_progress: 'warning',
  completed: 'success',
};

export interface InterventionReportScreenProps {
  interventionId: string;
  /** `edit` pour le technicien qui rédige, `read` pour le client qui consulte. */
  mode: 'read' | 'edit';
  onBack?: () => void;
  /** Appelé après l'enregistrement du rapport. */
  onDone?: () => void;
}

/** Rapport d'intervention : rédaction par le technicien, consultation par le client. */
export function InterventionReportScreen({
  interventionId,
  mode,
  onBack,
  onDone,
}: InterventionReportScreenProps) {
  const { t } = useTranslation();
  const intervention = useIntervention(interventionId);

  return (
    <Screen testID="rapport-intervention">
      <TopBar
        title={t(mode === 'edit' ? 'interventions:report.title' : 'interventions:report.readTitle')}
        onBack={onBack}
      />
      <QueryGate queries={[intervention]}>
        {() => (
          <View style={{ paddingHorizontal: 20, gap: 14 }}>
            <ReportSummary intervention={intervention.data!} />
            {mode === 'edit' ? (
              <ReportForm interventionId={interventionId} onDone={onDone} />
            ) : null}
          </View>
        )}
      </QueryGate>
    </Screen>
  );
}

function ReportSummary({ intervention }: { intervention: Intervention }) {
  const { t } = useTranslation();
  const materials = intervention.materials_used ?? [];
  const hasReport = Boolean(intervention.work_performed);

  return (
    <Card padding={16}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="section" style={{ flex: 1 }}>
            {intervention.request?.title ?? t('interventions:report.title')}
          </Text>
          <Pill
            size="sm"
            label={t(`interventions:report.statuses.${intervention.status}`)}
            tone={TONE_BY_STATUS[intervention.status]}
          />
        </View>
        {intervention.completed_at ? (
          <Text variant="caption" tone="muted">
            {formatDate(intervention.completed_at)}
          </Text>
        ) : null}
        {hasReport ? (
          <>
            <SectionLabel label={t('interventions:report.sections.work')} icon="wrench" />
            <Text>{intervention.work_performed}</Text>
            <SectionLabel label={t('interventions:report.sections.materials')} icon="cog" />
            {materials.length === 0 ? (
              <Text variant="label" tone="muted">
                {t('interventions:report.noMaterials')}
              </Text>
            ) : (
              materials.map((material) => <ListRow key={material} icon="cog" title={material} />)
            )}
            {intervention.duration_hours != null ? (
              <ListRow
                icon="clock"
                title={t('interventions:report.sections.duration')}
                detail={formatHours(intervention.duration_hours)}
              />
            ) : null}
            {intervention.notes ? (
              <>
                <SectionLabel label={t('interventions:report.sections.notes')} icon="info" />
                <Text tone="muted">{intervention.notes}</Text>
              </>
            ) : null}
          </>
        ) : (
          <Text variant="label" tone="muted">
            {t('interventions:report.noReport')}
          </Text>
        )}
      </View>
    </Card>
  );
}

function ReportForm({ interventionId, onDone }: { interventionId: string; onDone?: () => void }) {
  const { t } = useTranslation();
  const complete = useCompleteIntervention(interventionId);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { workPerformed: '', materials: '', hours: '', notes: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setNotice(null);
    setError(null);
    try {
      await complete.mutateAsync(toReportPayload(values));
      setNotice(t('interventions:report.submitted'));
      onDone?.();
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  return (
    <Card padding={16}>
      <View style={{ gap: 14 }}>
        <Text variant="section">{t('interventions:report.title')}</Text>
        <FormField
          control={form.control}
          name="workPerformed"
          label={t('interventions:report.fields.work')}
          multiline
        />
        <FormField
          control={form.control}
          name="materials"
          label={t('interventions:report.fields.materials')}
          multiline
        />
        <FormField
          control={form.control}
          name="hours"
          label={t('interventions:report.fields.hours')}
          icon="clock"
          keyboardType="decimal-pad"
        />
        <FormField
          control={form.control}
          name="notes"
          label={t('interventions:report.fields.notes')}
          multiline
        />
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        <Button
          label={t('interventions:report.submit')}
          icon="check"
          size="lg"
          full
          onPress={() => void submit()}
          loading={complete.isPending}
        />
      </View>
    </Card>
  );
}
