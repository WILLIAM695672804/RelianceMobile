import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { View } from 'react-native';

import {
  Banner,
  Button,
  Card,
  EmptyState,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  Text,
  TopBar,
} from '@/shared/ui';
import { formatClockTime, formatDate } from '@/shared/format';

import { useAppointments, useUpdateAppointmentStatus } from '../hooks/usePlanning';
import { appointmentToneOf, nextAppointmentStatuses } from '../model/schedule';
import type { Appointment } from '../schemas/planningSchemas';

export interface AppointmentsScreenProps {
  onBack?: () => void;
}

/** Rendez-vous des deux rôles ; le technicien seul fait évoluer le statut. */
export function AppointmentsScreen({ onBack }: AppointmentsScreenProps = {}) {
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

  return (
    <Screen
      testID="rendez-vous"
      onRefresh={() => void appointments.refetch()}
      refreshing={appointments.isRefetching}
    >
      <TopBar title={t('planning:appointments.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        <QueryGate queries={[appointments]}>
          {() =>
            (appointments.data ?? []).length === 0 ? (
              <EmptyState
                icon="calendar"
                title={t('planning:appointments.title')}
                message={t('planning:appointments.empty')}
              />
            ) : (
              <>{appointments.data!.map(renderAppointment)}</>
            )
          }
        </QueryGate>
      </View>
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

  const details = [
    appointment.technician
      ? t('planning:appointments.withTechnician', { name: appointment.technician.name })
      : null,
    place ? t('planning:appointments.place', { place }) : null,
    appointment.notes ? t('planning:appointments.notes', { notes: appointment.notes }) : null,
  ].filter((line): line is string => Boolean(line));
  const actions = editable ? nextAppointmentStatuses(appointment.status) : [];

  return (
    <Card padding={0}>
      <ListRow
        icon="calendar"
        title={t('planning:appointments.request', { title })}
        detail={
          appointment.scheduled_start
            ? t('planning:appointments.schedule', {
                date: formatDate(appointment.scheduled_start),
                time: formatClockTime(appointment.scheduled_start),
              })
            : undefined
        }
        trailing={
          <Pill
            size="sm"
            label={t(`planning:appointments.status.${appointment.status ?? 'unknown'}`, {
              defaultValue: t('planning:appointments.status.unknown'),
            })}
            tone={appointmentToneOf(appointment.status)}
          />
        }
      />
      {details.length > 0 || actions.length > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}>
          {details.map((line) => (
            <Text key={line} variant="caption" tone="muted">
              {line}
            </Text>
          ))}
          {actions.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {actions.map((status) => {
                const action = t(`planning:appointments.action.${status}`);
                return (
                  <Button
                    key={status}
                    label={action}
                    accessibilityLabel={t('planning:appointments.actionNamed', { action, title })}
                    size="sm"
                    variant={status === 'cancelled' || status === 'no_show' ? 'ghost' : 'soft'}
                    onPress={() => void change(status)}
                    disabled={updateStatus.isPending}
                  />
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
