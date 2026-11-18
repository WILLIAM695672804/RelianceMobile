import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDate } from '@/shared/format';
import { Card, EmptyState, ListRow, QueryGate, Screen, TopBar } from '@/shared/ui';

import { useJobs } from '../hooks/useMissions';
import { toneOf } from '../model/jobStatus';

export interface TechnicianJobsScreenProps {
  /** Ouverture du détail d'une mission. */
  onOpen: (jobId: string) => void;
  onBack?: () => void;
}

/** Historique des missions du technicien. */
export function TechnicianJobsScreen({ onOpen, onBack }: TechnicianJobsScreenProps) {
  const { t } = useTranslation();
  const jobs = useJobs();

  return (
    <Screen
      testID="historique"
      onRefresh={() => void jobs.refetch()}
      refreshing={jobs.isRefetching}
    >
      <TopBar title={t('missions:jobs.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        <QueryGate queries={[jobs]}>
          {() =>
            jobs.data!.jobs.length === 0 ? (
              <EmptyState
                icon="bolt"
                title={t('missions:jobs.title')}
                message={t('missions:jobs.empty')}
              />
            ) : (
              <Card padding={0}>
                {jobs.data!.jobs.map((job, index) => {
                  const title = job.request?.title ?? t('missions:jobs.detailTitle');
                  return (
                    <ListRow
                      key={job.id}
                      icon="bolt"
                      divider={index > 0}
                      title={title}
                      detail={[
                        job.created_at
                          ? t('missions:jobs.createdAt', { date: formatDate(job.created_at) })
                          : null,
                        job.completed_at
                          ? t('missions:jobs.completedAt', { date: formatDate(job.completed_at) })
                          : null,
                      ]
                        .filter(Boolean)
                        .join('\n')}
                      pill={{ label: t(`missions:status.${job.status}`), tone: toneOf(job.status) }}
                      accessibilityLabel={`${t('missions:jobs.open')} : ${title}`}
                      onPress={() => onOpen(job.id)}
                    />
                  );
                })}
              </Card>
            )
          }
        </QueryGate>
      </View>
    </Screen>
  );
}
