import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useJobs } from '../hooks/useMissions';
import { toneOf } from '../model/jobStatus';

export interface TechnicianJobsScreenProps {
  /** Ouverture du détail d'une mission. */
  onOpen: (jobId: string) => void;
}

/** Historique des missions du technicien. */
export function TechnicianJobsScreen({ onOpen }: TechnicianJobsScreenProps) {
  const { t } = useTranslation();
  const jobs = useJobs();

  const renderJobs = () => {
    if (jobs.isPending) return <StateView status="loading" />;
    if (jobs.isError) {
      return <StateView status="error" error={jobs.error} onRetry={() => void jobs.refetch()} />;
    }
    if (jobs.data.jobs.length === 0) {
      return <StateView status="empty" message={t('missions:jobs.empty')} />;
    }
    return jobs.data.jobs.map((job) => (
      <Card key={job.id}>
        <Text variant="subtitle">{job.request?.title ?? t('missions:jobs.detailTitle')}</Text>
        <Badge label={t(`missions:status.${job.status}`)} tone={toneOf(job.status)} />
        {job.created_at ? (
          <Text tone="muted">
            {t('missions:jobs.createdAt', { date: formatDate(job.created_at) })}
          </Text>
        ) : null}
        {job.completed_at ? (
          <Text tone="muted">
            {t('missions:jobs.completedAt', { date: formatDate(job.completed_at) })}
          </Text>
        ) : null}
        <Button
          label={t('missions:jobs.open')}
          onPress={() => onOpen(job.id)}
          variant="secondary"
        />
      </Card>
    ));
  };

  return (
    <Screen onRefresh={() => void jobs.refetch()} refreshing={jobs.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('missions:jobs.title')}
      </Text>
      {renderJobs()}
    </Screen>
  );
}
