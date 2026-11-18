import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDate } from '@/shared/format';
import { Card, ListRow, Pill, QueryGate, Screen, Section, Text, TopBar } from '@/shared/ui';

import { useJob } from '../hooks/useMissions';
import { PHASE_STATUSES, toneOf, type PhaseStatus } from '../model/jobStatus';
import type { Job } from '../schemas/missionSchemas';

export interface JobDetailScreenProps {
  jobId: string;
  onBack?: () => void;
}

const asPhaseStatus = (status: string): PhaseStatus =>
  (PHASE_STATUSES as readonly string[]).includes(status) ? (status as PhaseStatus) : 'pending';

const PHASE_TONES = { pending: 'neutral', in_progress: 'warning', completed: 'success' } as const;

/** Détail d'une mission : statut, dates, phases et compte rendu, en lecture seule. */
export function JobDetailScreen({ jobId, onBack }: JobDetailScreenProps) {
  const { t } = useTranslation();
  const job = useJob(jobId);
  return (
    <Screen
      testID="detail-mission"
      onRefresh={() => void job.refetch()}
      refreshing={job.isRefetching}
    >
      <TopBar title={t('missions:jobs.detailTitle')} onBack={onBack} />
      <QueryGate queries={[job]}>{() => <JobDetail job={job.data!} />}</QueryGate>
    </Screen>
  );
}

function JobDetail({ job }: { job: Job }) {
  const { t } = useTranslation();
  return (
    <>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Card padding={16}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="section" style={{ flex: 1 }}>
                {job.request
                  ? t('missions:jobs.request', { title: job.request.title })
                  : t('missions:jobs.detailTitle')}
              </Text>
              <Pill
                size="sm"
                label={t(`missions:status.${job.status}`)}
                tone={toneOf(job.status)}
              />
            </View>
            {job.started_at ? (
              <Text variant="caption" tone="muted">
                {t('missions:jobs.startedAt', { date: formatDate(job.started_at) })}
              </Text>
            ) : null}
            {job.completed_at ? (
              <Text variant="caption" tone="muted">
                {t('missions:jobs.completedAt', { date: formatDate(job.completed_at) })}
              </Text>
            ) : null}
            <Text>
              {job.completion_notes
                ? t('missions:jobs.notes', { notes: job.completion_notes })
                : t('missions:jobs.noNotes')}
            </Text>
          </View>
        </Card>
      </View>
      <Section title={t('missions:phases.title')}>
        <View style={{ paddingHorizontal: 20 }}>
          {job.phases.length === 0 ? (
            <Text variant="label" tone="muted">
              {t('missions:phases.empty')}
            </Text>
          ) : (
            <Card padding={0}>
              {job.phases.map((phase, index) => {
                const status = asPhaseStatus(phase.status);
                return (
                  <ListRow
                    key={`${phase.title}-${index}`}
                    divider={index > 0}
                    title={phase.title}
                    detail={phase.notes ?? undefined}
                    pill={{
                      label: t(`missions:phases.statusLabel.${status}`),
                      tone: PHASE_TONES[status],
                    }}
                  />
                );
              })}
            </Card>
          )}
        </View>
      </Section>
    </>
  );
}
