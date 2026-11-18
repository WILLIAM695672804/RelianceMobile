import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { useActiveMission, type ActiveMission } from '@/features/matching';
import { useTheme } from '@/core/theme';
import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  EmptyState,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';
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
  /** Ouverture des devis de la demande en cours. */
  onOpenQuotes?: (requestId: string) => void;
  /** Ouverture d'une conversation avec le client. */
  onContact?: (userId: string) => void;
  /** Planification d'un rendez-vous pour la demande en cours. */
  onPlanAppointment?: (requestId: string, technicianId: string) => void;
  /** Rédaction du rapport d'intervention de la mission en cours. */
  onOpenReport?: (jobId: string, requestId: string) => void;
  /** Annulation de la mission en cours. */
  onCancel?: (jobId: string) => void;
  onBack?: () => void;
}

/** E13, E14 — Cockpit du technicien : avancement, position et phases de la mission acceptée. */
export function MissionCockpitScreen({
  onOpenHistory,
  onOpenQuotes,
  onContact,
  onPlanAppointment,
  onOpenReport,
  onCancel,
  onBack,
}: MissionCockpitScreenProps) {
  const { t } = useTranslation();
  const mission = useActiveMission();
  const jobId = mission.data?.job?.id ?? null;
  useJobSync(jobId);

  return (
    <Screen
      testID="mission"
      onRefresh={() => void mission.refetch()}
      refreshing={mission.isRefetching}
    >
      <TopBar title={t('missions:cockpit.title')} onBack={onBack} />
      <QueryGate queries={[mission]}>
        {() =>
          mission.data === null || mission.data === undefined ? (
            <EmptyState
              icon="bolt"
              title={t('missions:cockpit.title')}
              message={t('missions:cockpit.none')}
              actionLabel={t('missions:cockpit.history')}
              onAction={onOpenHistory}
            />
          ) : (
            <>
              <MissionCockpit
                mission={mission.data}
                onOpenQuotes={onOpenQuotes}
                onContact={onContact}
                onPlanAppointment={onPlanAppointment}
                onOpenReport={onOpenReport}
                onCancel={onCancel}
              />
              <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                <Button
                  label={t('missions:cockpit.history')}
                  icon="clock"
                  variant="ghost"
                  full
                  onPress={onOpenHistory}
                />
              </View>
            </>
          )
        }
      </QueryGate>
    </Screen>
  );
}

function MissionCockpit({
  mission,
  onOpenQuotes,
  onContact,
  onPlanAppointment,
  onOpenReport,
  onCancel,
}: {
  mission: ActiveMission;
  onOpenQuotes?: (requestId: string) => void;
  onContact?: (userId: string) => void;
  onPlanAppointment?: (requestId: string, technicianId: string) => void;
  onOpenReport?: (jobId: string, requestId: string) => void;
  onCancel?: (jobId: string) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const client = mission.client;
  const technicianId = useSession((state) => state.user?.id ?? null);
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

  const actions = [
    onContact && client
      ? {
          key: 'contact',
          icon: 'chat' as const,
          label: t('missions:cockpit.contact'),
          onPress: () => onContact(client.id),
        }
      : null,
    onPlanAppointment && technicianId
      ? {
          key: 'appointment',
          icon: 'calendar' as const,
          label: t('missions:cockpit.appointment'),
          onPress: () => onPlanAppointment(mission.request.id, technicianId),
        }
      : null,
    onOpenQuotes
      ? {
          key: 'quotes',
          icon: 'file' as const,
          label: t('missions:cockpit.quotes'),
          onPress: () => onOpenQuotes(mission.request.id),
        }
      : null,
    onOpenReport && job
      ? {
          key: 'report',
          icon: 'edit' as const,
          label: t('missions:cockpit.report'),
          onPress: () => onOpenReport(job.id, mission.request.id),
        }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Card
          padding={18}
          style={{ backgroundColor: theme.tint.primary, borderColor: 'transparent' }}
        >
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text variant="title" style={{ flex: 1 }} numberOfLines={2}>
                {mission.request.title}
              </Text>
              {job ? (
                <Pill
                  size="sm"
                  label={t(`missions:status.${job.status}`)}
                  tone={toneOf(job.status)}
                />
              ) : null}
            </View>
            {mission.request.category ? (
              <Text variant="label" tone="muted">
                {mission.request.category}
              </Text>
            ) : null}
            <Text variant="section" tone="primary" style={{ fontFamily: theme.fontFamily.display }}>
              {t('missions:cockpit.amount', { amount: formatAmount(mission.price) })}
            </Text>
          </View>
        </Card>

        {mission.client || place ? (
          <Card padding={0}>
            {mission.client ? (
              <ListRow
                icon="user"
                title={t('missions:cockpit.client', { name: mission.client.name })}
              />
            ) : null}
            {place ? (
              <ListRow
                icon="pin"
                divider={Boolean(mission.client)}
                title={t('missions:cockpit.place', { place })}
              />
            ) : null}
          </Card>
        ) : null}

        {job ? (
          <Card padding={16}>
            <MissionTimeline status={job.status} />
          </Card>
        ) : null}

        {error ? <Banner tone="danger" message={error} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}

        {!job ? (
          <Button
            label={t('missions:cockpit.start')}
            icon="flash"
            size="lg"
            full
            onPress={() => void start()}
            loading={createJob.isPending}
          />
        ) : next === 'completed' ? (
          <Button
            label={t('missions:cockpit.advance.completed')}
            icon="check"
            size="lg"
            full
            onPress={() => setConfirming(true)}
            loading={updateStatus.isPending}
          />
        ) : next ? (
          <Button
            label={t(`missions:cockpit.advance.${next}`)}
            iconRight="arrowR"
            size="lg"
            full
            onPress={() => void advance(next)}
            loading={updateStatus.isPending}
          />
        ) : (
          <Banner tone="success" message={t('missions:cockpit.done')} />
        )}

        {confirming ? (
          <Card padding={16}>
            <View style={{ gap: 12 }}>
              <Text variant="section">{t('missions:cockpit.completeTitle')}</Text>
              <Text variant="label" tone="muted">
                {t('missions:cockpit.completeMessage', { title: mission.request.title })}
              </Text>
              <FormField
                control={form.control}
                name="notes"
                label={t('missions:cockpit.notes')}
                multiline
              />
              <Button
                label={t('missions:cockpit.confirm')}
                full
                onPress={() => void complete()}
                loading={updateStatus.isPending}
              />
              <Button
                label={t('common:actions.cancel')}
                variant="ghost"
                full
                onPress={() => setConfirming(false)}
              />
            </View>
          </Card>
        ) : null}

        {job && !isJobClosed(job.status) ? (
          <>
            <Button
              label={t('missions:cockpit.sharePosition')}
              icon="location"
              variant="soft"
              full
              onPress={() => void share()}
              loading={sharePosition.isPending}
            />
            {error === t('missions:cockpit.permissionDenied') ? (
              <Button
                label={t('missions:cockpit.openSettings')}
                variant="ghost"
                full
                onPress={() => void openAppSettings()}
              />
            ) : null}
          </>
        ) : null}
      </View>

      {actions.length > 0 ? (
        <Section>
          <View style={{ paddingHorizontal: 20 }}>
            <Card padding={0}>
              {actions.map((action, index) => (
                <ListRow
                  key={action.key}
                  icon={action.icon}
                  divider={index > 0}
                  title={action.label}
                  onPress={action.onPress}
                />
              ))}
            </Card>
          </View>
        </Section>
      ) : null}

      {job && working ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {/* La clé remonte la carte lorsque le serveur renvoie d'autres phases. */}
          <MissionPhasesCard key={JSON.stringify(phases)} jobId={job.id} phases={phases} />
        </View>
      ) : null}

      {onCancel && job && !isJobClosed(job.status) ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Button
            label={t('missions:cockpit.cancel')}
            icon="close"
            variant="ghost"
            full
            onPress={() => onCancel(job.id)}
          />
        </View>
      ) : null}
    </>
  );
}
