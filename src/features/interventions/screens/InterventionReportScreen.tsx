import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Badge,
  Button,
  Card,
  FormTextField,
  ListItem,
  Screen,
  SectionHeader,
  Snackbar,
  StateView,
  Text,
  type BadgeTone,
} from '@/shared/components';
import { formatDate, formatHours } from '@/shared/format';

import { useCompleteIntervention, useIntervention } from '../hooks/useInterventions';
import {
  reportFormSchema,
  toReportPayload,
  type Intervention,
  type InterventionStatus,
  type ReportFormValues,
} from '../schemas/interventionSchemas';

const TONE_BY_STATUS: Record<InterventionStatus, BadgeTone> = {
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
    <Screen
      title={t(mode === 'edit' ? 'interventions:report.title' : 'interventions:report.readTitle')}
      onBack={onBack}
      scroll
    >
      {intervention.isPending ? <StateView status="loading" /> : null}
      {intervention.isError ? (
        <StateView
          status="error"
          error={intervention.error}
          onRetry={() => void intervention.refetch()}
        />
      ) : null}
      {intervention.isSuccess ? (
        <>
          <ReportSummary intervention={intervention.data} />
          {mode === 'edit' ? <ReportForm interventionId={interventionId} onDone={onDone} /> : null}
        </>
      ) : null}
    </Screen>
  );
}

function ReportSummary({ intervention }: { intervention: Intervention }) {
  const { t } = useTranslation();
  const materials = intervention.materials_used ?? [];
  const hasReport = Boolean(intervention.work_performed);

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="subtitle" style={styles.title}>
          {intervention.request?.title ?? t('interventions:report.title')}
        </Text>
        <Badge
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
          <SectionHeader title={t('interventions:report.sections.work')} />
          <Text>{intervention.work_performed}</Text>
          <SectionHeader title={t('interventions:report.sections.materials')} />
          {materials.length === 0 ? (
            <Text tone="muted">{t('interventions:report.noMaterials')}</Text>
          ) : (
            materials.map((material) => <ListItem key={material} label={material} icon="cog" />)
          )}
          {intervention.duration_hours != null ? (
            <ListItem
              label={t('interventions:report.sections.duration')}
              detail={formatHours(intervention.duration_hours)}
              icon="clock"
            />
          ) : null}
          {intervention.notes ? (
            <>
              <SectionHeader title={t('interventions:report.sections.notes')} />
              <Text tone="muted">{intervention.notes}</Text>
            </>
          ) : null}
        </>
      ) : (
        <Text tone="muted">{t('interventions:report.noReport')}</Text>
      )}
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
    <Card>
      <SectionHeader title={t('interventions:report.title')} />
      <FormTextField
        control={form.control}
        name="workPerformed"
        label={t('interventions:report.fields.work')}
        multiline
      />
      <FormTextField
        control={form.control}
        name="materials"
        label={t('interventions:report.fields.materials')}
        multiline
      />
      <FormTextField
        control={form.control}
        name="hours"
        label={t('interventions:report.fields.hours')}
        keyboardType="decimal-pad"
      />
      <FormTextField
        control={form.control}
        name="notes"
        label={t('interventions:report.fields.notes')}
        multiline
      />
      {notice ? <Snackbar message={notice} tone="success" /> : null}
      {error ? <Snackbar message={error} tone="danger" /> : null}
      <Button
        label={t('interventions:report.submit')}
        icon="check"
        size="lg"
        fullWidth
        onPress={() => void submit()}
        loading={complete.isPending}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
});
