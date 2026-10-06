import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useCalendar, useCreateException, useDeleteException } from '../hooks/usePlanning';
import {
  exceptionFormSchema,
  toExceptionPayload,
  type ScheduleException,
} from '../schemas/planningSchemas';

/** Indisponibilités ponctuelles : liste, ajout et retrait. */
export function ExceptionsScreen() {
  const { t } = useTranslation();
  const calendar = useCalendar();
  const createException = useCreateException();
  const deleteException = useDeleteException();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(exceptionFormSchema),
    defaultValues: { startDate: '', endDate: '', reason: '' },
  });

  const reset = () => {
    setNotice(null);
    setError(null);
  };

  const rangeOf = (exception: ScheduleException) =>
    t('planning:exceptions.range', {
      start: formatDate(exception.start_ts ?? ''),
      end: formatDate(exception.end_ts ?? ''),
    });

  const add = form.handleSubmit(async (values) => {
    reset();
    try {
      await createException.mutateAsync(toExceptionPayload(values));
      form.reset({ startDate: '', endDate: '', reason: '' });
      setNotice(t('planning:exceptions.added'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  const remove = async (exception: ScheduleException) => {
    reset();
    try {
      await deleteException.mutateAsync(exception.id);
      setNotice(t('planning:exceptions.removed'));
    } catch {
      setError(t('planning:exceptions.failed'));
    }
  };

  const renderExceptions = () => {
    if (calendar.isPending) return <StateView status="loading" />;
    if (calendar.isError) {
      return (
        <StateView status="error" error={calendar.error} onRetry={() => void calendar.refetch()} />
      );
    }
    if (calendar.data.exceptions.length === 0) {
      return <StateView status="empty" message={t('planning:exceptions.empty')} />;
    }
    return calendar.data.exceptions.map((exception) => (
      <Card key={exception.id}>
        <Text>{rangeOf(exception)}</Text>
        <Text tone="muted">
          {exception.reason
            ? t('planning:exceptions.reason', { reason: exception.reason })
            : t('planning:exceptions.noReason')}
        </Text>
        <Button
          label={t('planning:exceptions.remove', { range: rangeOf(exception) })}
          accessibilityLabel={t('planning:exceptions.remove', { range: rangeOf(exception) })}
          onPress={() => void remove(exception)}
          disabled={deleteException.isPending}
          variant="ghost"
        />
      </Card>
    ));
  };

  return (
    <Screen scroll onRefresh={() => void calendar.refetch()} refreshing={calendar.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('planning:exceptions.title')}
      </Text>
      <Text tone="muted">{t('planning:exceptions.hint')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderExceptions()}
      <Card>
        <FormTextField
          control={form.control}
          name="startDate"
          label={t('planning:exceptions.start')}
        />
        <FormTextField control={form.control} name="endDate" label={t('planning:exceptions.end')} />
        <FormTextField
          control={form.control}
          name="reason"
          label={t('planning:exceptions.reasonField')}
        />
        <Button
          label={t('planning:exceptions.submit')}
          onPress={() => void add()}
          loading={createException.isPending}
        />
      </Card>
    </Screen>
  );
}
