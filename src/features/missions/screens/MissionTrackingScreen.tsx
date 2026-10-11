import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import {
  distanceBetween,
  formatAmount,
  formatClockTime,
  formatDistance,
  formatRating,
} from '@/shared/format';

import {
  useClientMission,
  useJobSync,
  useJobTracking,
  useTechnicianPosition,
} from '../hooks/useMissions';
import { PHASE_STATUSES, toneOf, type PhaseStatus } from '../model/jobStatus';
import type { ClientMission, JobTracking, LivePosition } from '../schemas/missionSchemas';
import { MissionTimeline } from './MissionTimeline';

const asPhaseStatus = (status: string): PhaseStatus =>
  (PHASE_STATUSES as readonly string[]).includes(status) ? (status as PhaseStatus) : 'pending';

export interface MissionTrackingScreenProps {
  /** Ouverture des devis de la demande suivie. */
  onOpenQuotes?: (requestId: string) => void;
  /** Ouverture d'une conversation avec le technicien. */
  onContact?: (userId: string) => void;
}

/** E15 — Suivi client : avancement de l'intervention et dernière position du technicien. */
export function MissionTrackingScreen({
  onOpenQuotes,
  onContact,
}: MissionTrackingScreenProps = {}) {
  const { t } = useTranslation();
  const mission = useClientMission();
  const jobId = mission.data?.job_id ?? null;
  const tracking = useJobTracking(jobId);
  const position = useTechnicianPosition();
  useJobSync(jobId);

  const refresh = () => {
    void mission.refetch();
    void position.refetch();
    if (jobId) void tracking.refetch();
  };

  const renderContent = () => {
    if (mission.isPending) return <StateView status="loading" />;
    if (mission.isError) {
      return (
        <StateView status="error" error={mission.error} onRetry={() => void mission.refetch()} />
      );
    }
    if (mission.data === null) {
      return <StateView status="empty" message={t('missions:tracking.none')} />;
    }
    return (
      <MissionTracking
        mission={mission.data}
        tracking={tracking.data ?? null}
        position={position.data ?? null}
        onOpenQuotes={onOpenQuotes}
        onContact={onContact}
      />
    );
  };

  return (
    <Screen
      title={t('missions:tracking.title')}
      onRefresh={refresh}
      refreshing={mission.isRefetching || tracking.isRefetching}
    >
      {renderContent()}
    </Screen>
  );
}

function MissionTracking({
  mission,
  tracking,
  position,
  onOpenQuotes,
  onContact,
}: {
  mission: ClientMission;
  tracking: JobTracking | null;
  position: LivePosition | null;
  onOpenQuotes?: (requestId: string) => void;
  onContact?: (userId: string) => void;
}) {
  const { t } = useTranslation();
  const technician = mission.technician;
  const place = [mission.address?.address, mission.address?.city].filter(Boolean).join(', ');
  const address = mission.address;
  const distance =
    position && address?.latitude != null && address.longitude != null
      ? distanceBetween(
          { latitude: address.latitude, longitude: address.longitude },
          { latitude: position.latitude, longitude: position.longitude },
        )
      : null;

  return (
    <>
      <Card>
        <Text variant="subtitle">{mission.request.title}</Text>
        {mission.request.category ? <Text tone="muted">{mission.request.category}</Text> : null}
        {tracking ? (
          <Badge label={t(`missions:status.${tracking.status}`)} tone={toneOf(tracking.status)} />
        ) : null}
        {mission.technician ? (
          <Text>{t('missions:tracking.technician', { name: mission.technician.name })}</Text>
        ) : null}
        {mission.technician?.rating != null ? (
          <Text tone="muted">
            {t('missions:tracking.rating', {
              rating: formatRating(mission.technician.rating),
              count: mission.technician.num_reviews ?? 0,
            })}
          </Text>
        ) : null}
        {mission.technician?.phone ? (
          <Text>{t('missions:tracking.phone', { phone: mission.technician.phone })}</Text>
        ) : null}
        {mission.proposal?.price != null ? (
          <Text>
            {t('missions:tracking.amount', { amount: formatAmount(mission.proposal.price) })}
          </Text>
        ) : null}
        {place ? <Text>{t('missions:tracking.place', { place })}</Text> : null}
      </Card>

      {onContact && technician ? (
        <Button
          label={t('missions:tracking.contact')}
          onPress={() => onContact(technician.id)}
          variant="secondary"
        />
      ) : null}

      {onOpenQuotes ? (
        <Button
          label={t('missions:tracking.quotes')}
          onPress={() => onOpenQuotes(mission.request.id)}
          variant="secondary"
        />
      ) : null}

      {tracking ? (
        <Card>
          <MissionTimeline status={tracking.status} />
        </Card>
      ) : (
        <Text tone="muted">{t('missions:tracking.notStarted')}</Text>
      )}

      <Card>
        {position ? (
          <>
            <Text>
              {t('missions:tracking.position', { time: formatClockTime(position.updated_at) })}
            </Text>
            {distance != null ? (
              <Text tone="muted">
                {t('missions:tracking.distance', { distance: formatDistance(distance) })}
              </Text>
            ) : null}
          </>
        ) : (
          <Text tone="muted">{t('missions:tracking.positionUnknown')}</Text>
        )}
      </Card>

      {tracking && tracking.phases.length > 0 ? (
        <>
          <Text variant="subtitle">{t('missions:phases.title')}</Text>
          {tracking.phases.map((phase, index) => (
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
          ))}
        </>
      ) : null}
    </>
  );
}
