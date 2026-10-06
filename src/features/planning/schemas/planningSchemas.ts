import { z } from 'zod';

import { normalizeTime } from '../model/schedule';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];
const timeField = z
  .string()
  .nullish()
  .transform((value) => normalizeTime(value));

/** Créneau hebdomadaire récurrent. */
export const timeSlotSchema = z.object({
  id: z.string(),
  day_of_week: z.number(),
  start_time: timeField,
  end_time: timeField,
  repeat_weekly: z.boolean().nullish(),
});
export type TimeSlot = z.infer<typeof timeSlotSchema>;

/** Indisponibilité ponctuelle. */
export const scheduleExceptionSchema = z.object({
  id: z.string(),
  start_ts: z.string().nullish(),
  end_ts: z.string().nullish(),
  reason: z.string().nullish(),
});
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>;

/** Rendez-vous (`AppointmentResource`), ou ligne brute du calendrier. */
export const appointmentSchema = z.object({
  id: z.string(),
  request_id: z.string().nullish(),
  technician_id: z.string().nullish(),
  request: z.object({ id: z.string(), title: z.string(), status: z.string().nullish() }).nullish(),
  technician: z.object({ id: z.string(), name: z.string() }).nullish(),
  location: z
    .object({ id: z.string(), address: z.string().nullish(), city: z.string().nullish() })
    .nullish(),
  scheduled_start: z.string().nullish(),
  scheduled_end: z.string().nullish(),
  status: z.string().nullable().default(null),
  notes: z.string().nullish(),
});
export type Appointment = z.infer<typeof appointmentSchema>;

export const appointmentResponseSchema = z.object({ data: appointmentSchema });
export const appointmentListResponseSchema = z.object({ data: z.array(appointmentSchema) });
export const appointmentPageSchema = z.object({
  data: z.array(appointmentSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/** Charge de travail calculée par le serveur. */
export const insightsSchema = z.object({
  capacity_percent: z.number().nullish(),
  booked_hours: z.number().nullish(),
  total_hours: z.number().nullish(),
});

export const calendarSchema = z.object({
  schedule_id: z.string(),
  timezone: z.string().nullish(),
  recurring_slots: z.array(timeSlotSchema).nullish().transform(asList),
  exceptions: z.array(scheduleExceptionSchema).nullish().transform(asList),
  appointments: z.array(appointmentSchema).nullish().transform(asList),
  insights: insightsSchema.nullish(),
});
export type Calendar = z.infer<typeof calendarSchema>;

export const calendarResponseSchema = z.object({ data: calendarSchema });
export const slotResponseSchema = z.object({ data: timeSlotSchema });
export const exceptionResponseSchema = z.object({ data: scheduleExceptionSchema });

/** Durée retenue lorsqu'aucune fin n'est saisie, en heures. */
export const DEFAULT_APPOINTMENT_HOURS = 2;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Formulaire d'un créneau hebdomadaire. */
export const slotFormSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().trim().regex(TIME_PATTERN, 'planning:slots.errors.timeInvalid'),
    endTime: z.string().trim().regex(TIME_PATTERN, 'planning:slots.errors.timeInvalid'),
  })
  .refine((values) => values.endTime > values.startTime, {
    path: ['endTime'],
    message: 'planning:slots.errors.endBeforeStart',
  });
export type SlotFormValues = z.infer<typeof slotFormSchema>;

/** Corps de `POST /technician/time-slots`. */
export interface SlotPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  repeatWeekly: boolean;
}

export function toSlotPayload(values: SlotFormValues): SlotPayload {
  return {
    dayOfWeek: values.dayOfWeek,
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
    repeatWeekly: true,
  };
}

/** Formulaire d'une indisponibilité, exprimée en journées entières. */
export const exceptionFormSchema = z
  .object({
    startDate: z.string().trim().regex(DATE_PATTERN, 'planning:exceptions.errors.dateInvalid'),
    endDate: z.string().trim().regex(DATE_PATTERN, 'planning:exceptions.errors.dateInvalid'),
    reason: z.string().max(255, 'planning:exceptions.errors.reasonTooLong'),
  })
  .refine((values) => values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'planning:exceptions.errors.endBeforeStart',
  });
export type ExceptionFormValues = z.infer<typeof exceptionFormSchema>;

/** Corps de `POST /technician/exceptions`. */
export interface ExceptionPayload {
  startTs: string;
  endTs: string;
  reason: string | null;
}

export function toExceptionPayload(values: ExceptionFormValues): ExceptionPayload {
  return {
    startTs: `${values.startDate.trim()}T00:00:00`,
    endTs: `${values.endDate.trim()}T23:59:00`,
    reason: values.reason.trim() || null,
  };
}

/** Formulaire d'un rendez-vous. */
export const appointmentFormSchema = z.object({
  date: z.string().trim().regex(DATE_PATTERN, 'planning:appointments.errors.dateInvalid'),
  time: z.string().trim().regex(TIME_PATTERN, 'planning:appointments.errors.timeInvalid'),
  notes: z.string().max(1000, 'planning:appointments.errors.notesTooLong'),
});
export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

/** Corps de `POST /appointments`. */
export interface AppointmentPayload {
  requestId: string;
  technicianId: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string | null;
}

/** Horodatage local, sans fuseau : le serveur l'interprète dans le sien. */
const localTimestamp = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}:00`;

export function toAppointmentPayload(
  requestId: string,
  technicianId: string,
  values: AppointmentFormValues,
): AppointmentPayload {
  const start = `${values.date.trim()}T${values.time.trim()}:00`;
  const end = new Date(start);
  end.setHours(end.getHours() + DEFAULT_APPOINTMENT_HOURS);
  return {
    requestId,
    technicianId,
    scheduledStart: start,
    scheduledEnd: localTimestamp(end),
    notes: values.notes.trim() || null,
  };
}
