import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';

import { useCalendar, useCreateTimeSlot, useDeleteTimeSlot } from '../hooks/usePlanning';
import { DAY_ORDER, groupSlotsByDay } from '../model/schedule';
import { slotFormSchema, toSlotPayload, type TimeSlot } from '../schemas/planningSchemas';

/** Créneaux hebdomadaires : liste par jour, ajout et retrait. */
export function TimeSlotsScreen() {
  const { t } = useTranslation();
  const calendar = useCalendar();
  const createSlot = useCreateTimeSlot();
  const deleteSlot = useDeleteTimeSlot();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(slotFormSchema),
    defaultValues: { dayOfWeek: 1, startTime: '', endTime: '' },
  });
  const dayOfWeek = useWatch({ control: form.control, name: 'dayOfWeek' });

  const reset = () => {
    setNotice(null);
    setError(null);
  };

  const rangeOf = (slot: TimeSlot) =>
    t('planning:slots.range', { start: slot.start_time, end: slot.end_time });

  const add = form.handleSubmit(async (values) => {
    reset();
    try {
      await createSlot.mutateAsync(toSlotPayload(values));
      form.reset({ dayOfWeek: values.dayOfWeek, startTime: '', endTime: '' });
      setNotice(t('planning:slots.added'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  const remove = async (slot: TimeSlot) => {
    reset();
    try {
      await deleteSlot.mutateAsync(slot.id);
      setNotice(t('planning:slots.removed'));
    } catch {
      setError(t('planning:slots.failed'));
    }
  };

  const renderSlots = () => {
    if (calendar.isPending) return <StateView status="loading" />;
    if (calendar.isError) {
      return (
        <StateView status="error" error={calendar.error} onRetry={() => void calendar.refetch()} />
      );
    }
    const groups = groupSlotsByDay(calendar.data.recurring_slots);
    if (groups.length === 0) {
      return <StateView status="empty" message={t('planning:slots.empty')} />;
    }
    return groups.map((group) => (
      <Card key={group.day}>
        <Text variant="subtitle">{t(`planning:days.${group.day}`)}</Text>
        {group.slots.map((slot) => (
          <View key={slot.id} style={styles.slot}>
            <Text>{rangeOf(slot)}</Text>
            <Button
              label={t('planning:slots.remove', {
                range: rangeOf(slot),
                day: t(`planning:days.${group.day}`),
              })}
              accessibilityLabel={t('planning:slots.remove', {
                range: rangeOf(slot),
                day: t(`planning:days.${group.day}`),
              })}
              onPress={() => void remove(slot)}
              disabled={deleteSlot.isPending}
              variant="ghost"
            />
          </View>
        ))}
      </Card>
    ));
  };

  return (
    <Screen scroll onRefresh={() => void calendar.refetch()} refreshing={calendar.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('planning:slots.title')}
      </Text>
      <Text tone="muted">{t('planning:slots.hint')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderSlots()}
      <Card>
        <Text variant="caption" tone="muted">
          {t('planning:slots.day')}
        </Text>
        <View style={styles.days}>
          {DAY_ORDER.map((day) => {
            const label = t(`planning:days.${day}`);
            return (
              <Button
                key={day}
                label={label}
                accessibilityLabel={t('planning:slots.chooseDay', { day: label })}
                onPress={() => form.setValue('dayOfWeek', day, { shouldValidate: true })}
                variant={dayOfWeek === day ? 'primary' : 'ghost'}
              />
            );
          })}
        </View>
        <FormTextField control={form.control} name="startTime" label={t('planning:slots.start')} />
        <FormTextField control={form.control} name="endTime" label={t('planning:slots.end')} />
        <Button
          label={t('planning:slots.submit')}
          onPress={() => void add()}
          loading={createSlot.isPending}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  slot: { gap: 4 },
  days: { gap: 8 },
});
