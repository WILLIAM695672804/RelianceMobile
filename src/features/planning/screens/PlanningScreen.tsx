import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatClockTime, formatDate } from '@/shared/format';

import { useCalendar, useUpcomingAppointments } from '../hooks/usePlanning';
import { appointmentToneOf } from '../model/schedule';
import type { Appointment, Calendar } from '../schemas/planningSchemas';

export interface PlanningScreenProps {
  onOpenSlots: () => void;
  onOpenExceptions: () => void;
  onOpenAppointments: () => void;
}

/** E25 — Planning : charge de travail, disponibilités déclarées et rendez-vous à venir. */
export function PlanningScreen({
  onOpenSlots,
  onOpenExceptions,
  onOpenAppointments,
}: PlanningScreenProps) {
  const { t } = useTranslation();
  const calendar = useCalendar();
  const upcoming = useUpcomingAppointments();

  const refresh = () => {
    void calendar.refetch();
    void upcoming.refetch();
  };

  const renderOverview = (data: Calendar) => (
    <Card>
      {data.timezone ? (
        <Text variant="caption" tone="muted">
          {t('planning:overview.timezone', { timezone: data.timezone })}
        </Text>
      ) : null}
      <Text variant="subtitle">
        {t('planning:overview.capacity', { percent: data.insights?.capacity_percent ?? 0 })}
      </Text>
      <Text>
        {t('planning:overview.hours', {
          booked: data.insights?.booked_hours ?? 0,
          total: data.insights?.total_hours ?? 0,
        })}
      </Text>
      <Text variant="caption" tone="muted">
        {t('planning:overview.capacityNotice')}
      </Text>
      <Text>{t('planning:overview.slots', { count: data.recurring_slots.length })}</Text>
      <Text>{t('planning:overview.exceptions', { count: data.exceptions.length })}</Text>
    </Card>
  );

  const renderAppointment = (appointment: Appointment) => (
    <Card key={appointment.id}>
      <Text variant="subtitle">
        {appointment.request
          ? t('planning:appointments.request', { title: appointment.request.title })
          : t('planning:appointments.title')}
      </Text>
      <Badge
        label={t(`planning:appointments.status.${appointment.status ?? 'unknown'}`, {
          defaultValue: t('planning:appointments.status.unknown'),
        })}
        tone={appointmentToneOf(appointment.status)}
      />
      {appointment.scheduled_start ? (
        <Text>
          {t('planning:appointments.schedule', {
            date: formatDate(appointment.scheduled_start),
            time: formatClockTime(appointment.scheduled_start),
          })}
        </Text>
      ) : null}
    </Card>
  );

  const renderUpcoming = () => {
    if (upcoming.isPending) return <StateView status="loading" />;
    if (upcoming.isError) {
      return (
        <StateView status="error" error={upcoming.error} onRetry={() => void upcoming.refetch()} />
      );
    }
    if (upcoming.data.length === 0) {
      return <StateView status="empty" message={t('planning:overview.noUpcoming')} />;
    }
    return upcoming.data.map(renderAppointment);
  };

  return (
    <Screen
      title={t('planning:overview.title')}
      onRefresh={refresh}
      refreshing={calendar.isRefetching}
    >
      {calendar.isPending ? <StateView status="loading" /> : null}
      {calendar.isError ? (
        <StateView status="error" error={calendar.error} onRetry={() => void calendar.refetch()} />
      ) : null}
      {calendar.isSuccess ? renderOverview(calendar.data) : null}
      <Button label={t('planning:overview.openSlots')} onPress={onOpenSlots} variant="secondary" />
      <Button
        label={t('planning:overview.openExceptions')}
        onPress={onOpenExceptions}
        variant="secondary"
      />
      <Button
        label={t('planning:overview.openAppointments')}
        onPress={onOpenAppointments}
        variant="secondary"
      />
      <Text variant="subtitle">{t('planning:overview.upcoming')}</Text>
      {renderUpcoming()}
    </Screen>
  );
}
