import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatClockTime, formatDate } from '@/shared/format';

import { useAppointments, useUpdateAppointmentStatus } from '../hooks/usePlanning';
import { appointmentToneOf, nextAppointmentStatuses } from '../model/schedule';
import type { Appointment } from '../schemas/planningSchemas';

/** Rendez-vous des deux rôles ; le technicien seul fait évoluer le statut. */
export function AppointmentsScreen() {
  const { t } = useTranslation();
  const role = useSession((state) => state.user?.role);
  const appointments = useAppointments();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderAppointment = (appointment: Appointment) => (
    <AppointmentCard
      key={appointment.id}
      appointment={appointment}
      editable={role === 'technicien'}
      onDone={(message) => {
        setError(null);
        setNotice(message);
      }}
      onFailed={(message) => {
        setNotice(null);
        setError(message);
      }}
    />
  );

  const renderList = () => {
    if (appointments.isPending) return <StateView status="loading" />;
    if (appointments.isError) {
      return (
        <StateView
          status="error"
          error={appointments.error}
          onRetry={() => void appointments.refetch()}
        />
      );
    }
    if (appointments.data.length === 0) {
      return <StateView status="empty" message={t('planning:appointments.empty')} />;
    }
    return appointments.data.map(renderAppointment);
  };

  return (
    <Screen
      title={t('planning:appointments.title')}
      onRefresh={() => void appointments.refetch()}
      refreshing={appointments.isRefetching}
    >
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderList()}
    </Screen>
  );
}

function AppointmentCard({
  appointment,
  editable,
  onDone,
  onFailed,
}: {
  appointment: Appointment;
  editable: boolean;
  onDone: (message: string) => void;
  onFailed: (message: string) => void;
}) {
  const { t } = useTranslation();
  const updateStatus = useUpdateAppointmentStatus(appointment.id);
  const title = appointment.request?.title ?? t('planning:appointments.title');
  const place = [appointment.location?.address, appointment.location?.city]
    .filter(Boolean)
    .join(', ');

  const change = async (status: string) => {
    try {
      await updateStatus.mutateAsync(status);
      onDone(t('planning:appointments.updated'));
    } catch (cause) {
      const appError = normalizeError(cause);
      onFailed(appError.serverMessage ?? describeError(appError, t));
    }
  };

  return (
    <Card>
      <Text variant="subtitle">{t('planning:appointments.request', { title })}</Text>
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
      {appointment.technician ? (
        <Text tone="muted">
          {t('planning:appointments.withTechnician', { name: appointment.technician.name })}
        </Text>
      ) : null}
      {place ? <Text tone="muted">{t('planning:appointments.place', { place })}</Text> : null}
      {appointment.notes ? (
        <Text tone="muted">{t('planning:appointments.notes', { notes: appointment.notes })}</Text>
      ) : null}
      {editable
        ? nextAppointmentStatuses(appointment.status).map((status) => {
            const action = t(`planning:appointments.action.${status}`);
            return (
              <Button
                key={status}
                label={action}
                accessibilityLabel={t('planning:appointments.actionNamed', { action, title })}
                onPress={() => void change(status)}
                disabled={updateStatus.isPending}
                variant={status === 'cancelled' || status === 'no_show' ? 'ghost' : 'secondary'}
              />
            );
          })
        : null}
    </Card>
  );
}
