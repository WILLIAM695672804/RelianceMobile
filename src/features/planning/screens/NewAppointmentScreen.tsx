import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { useCreateAppointment } from '../hooks/usePlanning';
import { appointmentFormSchema, toAppointmentPayload } from '../schemas/planningSchemas';

export interface NewAppointmentScreenProps {
  requestId: string;
  technicianId: string;
  /** Rendez-vous planifié : retour à l'écran appelant. */
  onCreated: () => void;
}

/** Planification d'un rendez-vous pour une demande attribuée. */
export function NewAppointmentScreen({
  requestId,
  technicianId,
  onCreated,
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
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('planning:appointments.newTitle')}
      </Text>
      <Text tone="muted">{t('planning:appointments.newHint')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <FormTextField control={form.control} name="date" label={t('planning:appointments.date')} />
      <FormTextField control={form.control} name="time" label={t('planning:appointments.time')} />
      <FormTextField
        control={form.control}
        name="notes"
        label={t('planning:appointments.notesField')}
        multiline
      />
      <Button
        label={t('planning:appointments.submit')}
        onPress={() => void onSubmit()}
        loading={createAppointment.isPending}
      />
    </Screen>
  );
}
