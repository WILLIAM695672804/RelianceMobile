import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { View } from 'react-native';

import { FormField } from '@/shared/forms';
import { Banner, Button, Screen, Text, TopBar } from '@/shared/ui';

import { useCreateAppointment } from '../hooks/usePlanning';
import { appointmentFormSchema, toAppointmentPayload } from '../schemas/planningSchemas';

export interface NewAppointmentScreenProps {
  requestId: string;
  technicianId: string;
  /** Rendez-vous planifié : retour à l'écran appelant. */
  onCreated: () => void;
  onBack?: () => void;
}

/** Planification d'un rendez-vous pour une demande attribuée. */
export function NewAppointmentScreen({
  requestId,
  technicianId,
  onCreated,
  onBack,
}: NewAppointmentScreenProps) {
  const { t } = useTranslation();
  const createAppointment = useCreateAppointment();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: { date: '', time: '', notes: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setNotice(null);
    try {
      await createAppointment.mutateAsync(toAppointmentPayload(requestId, technicianId, values));
      setNotice(t('planning:appointments.created'));
      onCreated();
    } catch (cause) {
      const appError = normalizeError(cause);
      // Le serveur indexe les champs sous leur nom d'API : la date est le seul champ partagé.
      const scheduleError = appError.fieldErrors.scheduled_start?.[0];
      if (scheduleError) setError(scheduleError);
      else if (!applyServerErrors(form.setError, appError)) {
        setError(describeError(appError, t));
      }
    }
  });

  return (
    <Screen
      testID="nouveau-rendez-vous"
      footer={
        <Button
          label={t('planning:appointments.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={createAppointment.isPending}
        />
      }
    >
      <TopBar title={t('planning:appointments.newTitle')} onBack={onBack ?? onCreated} />
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Text variant="label" tone="muted">
          {t('planning:appointments.newHint')}
        </Text>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        <FormField
          control={form.control}
          name="date"
          label={t('planning:appointments.date')}
          icon="calendar"
          placeholder="AAAA-MM-JJ"
        />
        <FormField
          control={form.control}
          name="time"
          label={t('planning:appointments.time')}
          icon="clock"
          placeholder="HH:MM"
        />
        <FormField
          control={form.control}
          name="notes"
          label={t('planning:appointments.notesField')}
          multiline
        />
      </View>
    </Screen>
  );
}
