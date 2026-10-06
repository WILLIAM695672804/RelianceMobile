import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useActiveMission, type ActiveMission } from '@/features/matching';
import { Badge, Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';
import { formatAmount } from '@/shared/format';
import { locateDevice, openAppSettings } from '@/shared/location';

import {
  useCreateJob,
  useJobSync,
  useShareMyPosition,
  useUpdateJobStatus,
} from '../hooks/useMissions';
import { isJobClosed, nextStatusOf, toneOf } from '../model/jobStatus';
import { completionFormSchema, type JobPhase } from '../schemas/missionSchemas';
import { MissionPhasesCard } from './MissionPhasesCard';
import { MissionTimeline } from './MissionTimeline';

export interface MissionCockpitScreenProps {
  /** Ouverture de l'historique des missions. */
  onOpenHistory: () => void;
}

/** E13, E14 — Cockpit du technicien : avancement, position et phases de la mission acceptée. */
export function MissionCockpitScreen({ onOpenHistory }: MissionCockpitScreenProps) {
  const { t } = useTranslation();
  const mission = useActiveMission();
  const jobId = mission.data?.job?.id ?? null;
  useJobSync(jobId);

  const renderContent = () => {
    if (mission.isPending) return <StateView status="loading" />;
    if (mission.isError) {
      return (
        <StateView status="error" error={mission.error} onRetry={() => void mission.refetch()} />
      );
    }
    if (mission.data === null) {
      return <StateView status="empty" message={t('missions:cockpit.none')} />;
    }
    return <MissionCockpit mission={mission.data} />;
  };

  return (
    <Screen scroll onRefresh={() => void mission.refetch()} refreshing={mission.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('missions:cockpit.title')}
      </Text>
      {renderContent()}
      <Button label={t('missions:cockpit.history')} onPress={onOpenHistory} variant="secondary" />
    </Screen>
  );
}

function MissionCockpit({ mission }: { mission: ActiveMission }) {
  const { t } = useTranslation();
  const job = mission.job;
  const createJob = useCreateJob();
  const updateStatus = useUpdateJobStatus(job?.id ?? '');
  const sharePosition = useShareMyPosition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const form = useForm({
    resolver: zodResolver(completionFormSchema),
    defaultValues: { notes: '' },
  });

  const place = [mission.address?.address, mission.address?.city].filter(Boolean).join(', ');
  const next = job ? nextStatusOf(job.status) : null;
  const phases: JobPhase[] = (job?.phases ?? []).map((phase) => ({
    title: phase.title,
    status: phase.status,
    notes: phase.notes ?? null,
  }));
  const working = job ? ['in_progress', 'arrived'].includes(job.status) : false;

  const reset = () => {
    setError(null);
    setNotice(null);
  };

  const start = async () => {
    reset();
    try {
      await createJob.mutateAsync(mission.request.id);
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const advance = async (status: string) => {
    reset();
    try {
      await updateStatus.mutateAsync({ status });
    } catch {
      setError(t('missions:cockpit.updateFailed'));
    }
  };

  const complete = form.handleSubmit(async (values) => {
    reset();
    setConfirming(false);
    try {
      await updateStatus.mutateAsync({
        status: 'completed',
        completionNotes: values.notes.trim() || null,
      });
    } catch {
      setError(t('missions:cockpit.updateFailed'));
    }
  });

  const share = async () => {
    reset();
    const located = await locateDevice();
    if (located.status !== 'located') {
      setError(
        t(
          located.status === 'denied'
            ? 'missions:cockpit.permissionDenied'
            : 'missions:cockpit.positionUnavailable',
        ),
      );
      return;
    }
    try {
      await sharePosition.mutateAsync({
        latitude: located.place.latitude,
        longitude: located.place.longitude,
      });
      setNotice(t('missions:cockpit.positionShared'));
    } catch {
      setError(t('missions:cockpit.updateFailed'));
    }
  };

  return (
    <>
      <Card>
        <Text variant="subtitle">{mission.request.title}</Text>
        {mission.request.category ? <Text tone="muted">{mission.request.category}</Text> : null}
        {job ? (
          <Badge label={t(`missions:status.${job.status}`)} tone={toneOf(job.status)} />
        ) : null}
        {mission.client ? (
          <Text>{t('missions:cockpit.client', { name: mission.client.name })}</Text>
        ) : null}
        {place ? <Text>{t('missions:cockpit.place', { place })}</Text> : null}
        <Text>{t('missions:cockpit.amount', { amount: formatAmount(mission.price) })}</Text>
        {job ? <MissionTimeline status={job.status} /> : null}
      </Card>

      {error ? <Text tone="danger">{error}</Text> : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}

      {!job ? (
        <Button
          label={t('missions:cockpit.start')}
          onPress={() => void start()}
          loading={createJob.isPending}
        />
      ) : next === 'completed' ? (
        <Button
          label={t('missions:cockpit.advance.completed')}
          onPress={() => setConfirming(true)}
          loading={updateStatus.isPending}
        />
      ) : next ? (
        <Button
          label={t(`missions:cockpit.advance.${next}`)}
          onPress={() => void advance(next)}
          loading={updateStatus.isPending}
        />
      ) : (
        <Text tone="primary">{t('missions:cockpit.done')}</Text>
      )}

      {job && !isJobClosed(job.status) ? (
        <>
          <Button
            label={t('missions:cockpit.sharePosition')}
            onPress={() => void share()}
            loading={sharePosition.isPending}
            variant="secondary"
          />
          {error === t('missions:cockpit.permissionDenied') ? (
            <Button
              label={t('missions:cockpit.openSettings')}
              onPress={() => void openAppSettings()}
              variant="ghost"
            />
          ) : null}
        </>
      ) : null}

      {job && working ? (
        // La clé remonte la carte lorsque le serveur renvoie d'autres phases.
        <MissionPhasesCard key={JSON.stringify(phases)} jobId={job.id} phases={phases} />
      ) : null}

      {confirming ? (
        <Card>
          <Text variant="subtitle">{t('missions:cockpit.completeTitle')}</Text>
          <Text>{t('missions:cockpit.completeMessage', { title: mission.request.title })}</Text>
          <FormTextField
            control={form.control}
            name="notes"
            label={t('missions:cockpit.notes')}
            multiline
          />
          <Button
            label={t('missions:cockpit.confirm')}
            onPress={() => void complete()}
            loading={updateStatus.isPending}
          />
          <Button
            label={t('common:actions.cancel')}
            onPress={() => setConfirming(false)}
            variant="ghost"
          />
        </Card>
      ) : null}
    </>
  );
}
