import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { QueryGate, useToast } from '@/shared/ui';

import {
  useCalendar,
  useCreateException,
  useCreateTimeSlot,
  useDeleteTimeSlot,
} from '../hooks/usePlanning';
import { exceptionFormSchema, toExceptionPayload, type Calendar } from '../schemas/planningSchemas';
import {
  AvailabilityView,
  BlockAgendaView,
  PlanningWeekView,
  type AgendaEvent,
  type AvailabilityValues,
  type BlockValues,
} from '../ui/PlanningViews';

const DAY_MS = 86_400_000;
/** Amplitude d'une journée d'indisponibilité dans la grille (heures). */
const DAY_SPAN = { start: 8, end: 19 } as const;
/** Horaires proposés à l'ouverture d'un jour de repos. */
const DEFAULT_HOURS = { start: '08:00', end: '18:00' } as const;

/** Lundi 0 h de la semaine contenant `date`. */
export function mondayOf(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/** Jour du serveur (0 = dimanche) vers celui de la grille (0 = lundi). */
const gridDay = (dayOfWeek: number) => (dayOfWeek + 6) % 7;

const hoursOf = (time: string | null | undefined): number => {
  const [hours, minutes] = (time ?? '00:00').split(':').map(Number);
  return (hours ?? 0) + (minutes ?? 0) / 60;
};

const decimalHours = (date: Date) => date.getHours() + date.getMinutes() / 60;

/**
 * Horodatage relu en heure locale : l'application transmet des heures sans fuseau, que le
 * serveur renvoie suffixées de « Z ». Les relire en UTC décalerait jours et heures.
 */
export function naiveDate(timestamp: string): Date {
  return new Date(timestamp.replace(/(\.\d+)?Z$/, ''));
}

/**
 * Événements de la semaine : créneaux récurrents (disponible), indisponibilités (congé) et
 * rendez-vous (confirmé, ou en attente tant que le serveur ne les a pas confirmés).
 */
export function weekEvents(
  calendar: Calendar,
  monday: Date,
  labels: { open: string; leave: string },
): AgendaEvent[] {
  const end = new Date(monday.getTime() + 7 * DAY_MS);
  const events: AgendaEvent[] = calendar.recurring_slots.map((slot) => ({
    id: `slot-${slot.id}`,
    day: gridDay(slot.day_of_week),
    start: hoursOf(slot.start_time),
    end: hoursOf(slot.end_time),
    title: labels.open,
    kind: 'open',
  }));
  for (const exception of calendar.exceptions) {
    if (!exception.start_ts || !exception.end_ts) continue;
    const from = naiveDate(exception.start_ts);
    const to = naiveDate(exception.end_ts);
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(monday.getTime() + day * DAY_MS);
      const next = new Date(date.getTime() + DAY_MS);
      if (from < next && to >= date) {
        events.push({
          id: `exception-${exception.id}-${day}`,
          day,
          ...DAY_SPAN,
          title: exception.reason ?? labels.leave,
          kind: 'leave',
        });
      }
    }
  }
  for (const appointment of calendar.appointments) {
    if (!appointment.scheduled_start) continue;
    const start = naiveDate(appointment.scheduled_start);
    if (start < monday || start >= end) continue;
    const finish = appointment.scheduled_end ? naiveDate(appointment.scheduled_end) : null;
    events.push({
      id: `appointment-${appointment.id}`,
      day: Math.floor((start.getTime() - monday.getTime()) / DAY_MS),
      start: decimalHours(start),
      end: finish ? decimalHours(finish) : decimalHours(start) + 2,
      title: appointment.request?.title ?? '',
      detail: appointment.location?.city ?? appointment.location?.address ?? undefined,
      kind: appointment.status === 'confirmed' ? 'mission' : 'pending',
    });
  }
  return events;
}

export interface PlanningWeekContainerProps {
  onBack?: () => void;
  onBlock: () => void;
  onAvailability: () => void;
  /** Rendez-vous touché dans la grille : liste des rendez-vous. */
  onAppointments: () => void;
}

/** Semaine du technicien : créneaux, indisponibilités et rendez-vous du calendrier serveur. */
export function PlanningWeekContainer(props: PlanningWeekContainerProps) {
  const { t } = useTranslation();
  const calendar = useCalendar();
  const [offset, setOffset] = useState(0);
  const monday = new Date(mondayOf(new Date()).getTime() + offset * 7 * DAY_MS);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const format = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const todayIndex = offset === 0 ? (new Date().getDay() + 6) % 7 : null;

  return (
    <QueryGate queries={[calendar]}>
      {() => {
        const data = calendar.data!;
        const insights = data.insights;
        const events = weekEvents(data, monday, {
          open: t('planning:week.kinds.open'),
          leave: t('planning:week.kinds.leave'),
        });
        return (
          <PlanningWeekView
            weekLabel={`${format(monday)} – ${format(sunday)}`}
            dayLabels={[1, 2, 3, 4, 5, 6, 0].map((day) => t(`planning:days.${day}`).slice(0, 3))}
            todayIndex={todayIndex}
            stats={[
              {
                label: t('planning:weekStats.booked'),
                value: `${insights?.booked_hours ?? 0} h`,
                detail: t('planning:weekStats.of', { hours: insights?.total_hours ?? 0 }),
              },
              {
                label: t('planning:weekStats.capacity'),
                value: `${insights?.capacity_percent ?? 0} %`,
                detail: t('planning:weekStats.capacityDetail'),
              },
              {
                label: t('planning:weekStats.appointments'),
                value: String(
                  events.filter((event) => event.kind !== 'open' && event.kind !== 'leave').length,
                ),
                detail: t('planning:weekStats.thisWeek'),
              },
            ]}
            events={events}
            onBack={props.onBack}
            onPreviousWeek={() => setOffset((value) => value - 1)}
            onNextWeek={() => setOffset((value) => value + 1)}
            onEvent={(event) => {
              if (event.id.startsWith('appointment-')) props.onAppointments();
            }}
            onBlock={props.onBlock}
            onAvailability={props.onAvailability}
          />
        );
      }}
    </QueryGate>
  );
}

export interface BlockAgendaContainerProps {
  onDone: () => void;
}

/** Indisponibilité : motif et période, enregistrés en journées entières. */
export function BlockAgendaContainer({ onDone }: BlockAgendaContainerProps) {
  const { t } = useTranslation();
  const create = useCreateException();
  const [formError, setFormError] = useState<string | null>(null);
  const today = new Date();
  const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const submit = async (values: BlockValues) => {
    const reason = [t(`planning:block.reasons.${values.reason}`), values.note.trim()]
      .filter(Boolean)
      .join(' · ');
    const parsed = exceptionFormSchema.safeParse({
      startDate: values.from,
      endDate: values.to,
      reason,
    });
    if (!parsed.success) {
      setFormError(t(parsed.error.issues[0]!.message));
      return;
    }
    setFormError(null);
    try {
      await create.mutateAsync(toExceptionPayload(parsed.data));
      onDone();
    } catch (error) {
      setFormError(describeError(normalizeError(error), t));
    }
  };

  return (
    <BlockAgendaView
      initial={{ reason: 'vacation', from: iso(today), to: iso(today), allDay: true, note: '' }}
      submitting={create.isPending}
      formError={formError}
      onCancel={onDone}
      onSubmit={(values) => void submit(values)}
    />
  );
}

/** Horaires hebdomadaires tirés des créneaux récurrents (premier créneau de chaque jour). */
export function toWeeklyHours(calendar: Calendar): AvailabilityValues['week'] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const slot = calendar.recurring_slots.find((item) => gridDay(item.day_of_week) === day);
    return {
      day,
      open: Boolean(slot),
      start: slot?.start_time ?? DEFAULT_HOURS.start,
      end: slot?.end_time ?? DEFAULT_HOURS.end,
    };
  });
}

export interface AvailabilityContainerProps {
  onBack: () => void;
}

/**
 * Disponibilités : un jour ouvert devient un créneau récurrent, un jour fermé perd les
 * siens. Seuls les jours modifiés sont transmis au serveur.
 */
export function AvailabilityContainer({ onBack }: AvailabilityContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const calendar = useCalendar();
  const createSlot = useCreateTimeSlot();
  const deleteSlot = useDeleteTimeSlot();
  const [saving, setSaving] = useState(false);

  const save = async (values: AvailabilityValues) => {
    const data = calendar.data;
    if (!data) return;
    setSaving(true);
    try {
      for (const item of values.week) {
        const slots = data.recurring_slots.filter((slot) => gridDay(slot.day_of_week) === item.day);
        if (!item.open) {
          for (const slot of slots) await deleteSlot.mutateAsync(slot.id);
        } else if (slots.length === 0) {
          await createSlot.mutateAsync({
            dayOfWeek: (item.day + 1) % 7,
            startTime: item.start,
            endTime: item.end,
            repeatWeekly: true,
          });
        }
      }
      toast.show({ kind: 'success', title: t('planning:weekStats.saved') });
      onBack();
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <QueryGate queries={[calendar]}>
      {() => (
        <AvailabilityView
          dayNames={[1, 2, 3, 4, 5, 6, 0].map((day) => t(`planning:days.${day}`))}
          initial={{
            available: true,
            week: toWeeklyHours(calendar.data!),
            maxPerDay: 4,
            urgent: false,
          }}
          weeklyOnly
          saving={saving}
          onBack={onBack}
          onSave={(values) => void save(values)}
        />
      )}
    </QueryGate>
  );
}
