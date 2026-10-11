import { useTranslation } from 'react-i18next';

import { Badge, Card, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useJob } from '../hooks/useMissions';
import { PHASE_STATUSES, toneOf, type PhaseStatus } from '../model/jobStatus';
import type { Job } from '../schemas/missionSchemas';

export interface JobDetailScreenProps {
  jobId: string;
}

const asPhaseStatus = (status: string): PhaseStatus =>
  (PHASE_STATUSES as readonly string[]).includes(status) ? (status as PhaseStatus) : 'pending';

/** Détail d'une mission : statut, dates, phases et compte rendu, en lecture seule. */
export function JobDetailScreen({ jobId }: JobDetailScreenProps) {
  const { t } = useTranslation();
  const job = useJob(jobId);

  const renderContent = () => {
    if (job.isPending) return <StateView status="loading" />;
    if (job.isError) {
      return <StateView status="error" error={job.error} onRetry={() => void job.refetch()} />;
    }
    return <JobDetail job={job.data} />;
  };

  return (
    <Screen
      title={t('missions:jobs.detailTitle')}
      scroll
      onRefresh={() => void job.refetch()}
      refreshing={job.isRefetching}
    >
      {renderContent()}
    </Screen>
  );
}

function JobDetail({ job }: { job: Job }) {
  const { t } = useTranslation();
  return (
    <>
      <Card>
        {job.request ? (
          <Text variant="subtitle">{t('missions:jobs.request', { title: job.request.title })}</Text>
        ) : null}
        <Badge label={t(`missions:status.${job.status}`)} tone={toneOf(job.status)} />
        {job.started_at ? (
          <Text tone="muted">
            {t('missions:jobs.startedAt', { date: formatDate(job.started_at) })}
          </Text>
        ) : null}
        {job.completed_at ? (
          <Text tone="muted">
            {t('missions:jobs.completedAt', { date: formatDate(job.completed_at) })}
          </Text>
        ) : null}
        <Text>
          {job.completion_notes
            ? t('missions:jobs.notes', { notes: job.completion_notes })
            : t('missions:jobs.noNotes')}
        </Text>
      </Card>
      <Text variant="subtitle">{t('missions:phases.title')}</Text>
      {job.phases.length === 0 ? (
        <Text tone="muted">{t('missions:phases.empty')}</Text>
      ) : (
        job.phases.map((phase, index) => (
          <Card key={`${phase.title}-${index}`}>
            <Text>{phase.title}</Text>
            <Text tone="muted">
              {t(`missions:phases.statusLabel.${asPhaseStatus(phase.status)}`)}
            </Text>
            {phase.notes ? (
              <Text variant="caption" tone="muted">
                {phase.notes}
              </Text>
            ) : null}
          </Card>
        ))
      )}
    </>
  );
}
