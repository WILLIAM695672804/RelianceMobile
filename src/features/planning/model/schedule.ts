import type { BadgeTone } from '@/shared/components';

/** Jours de la semaine dans l'ordre d'usage ; le serveur suit Carbon (0 = dimanche). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Statuts d'un rendez-vous (`appointments.status`). */
export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

const APPOINTMENT_TONES: Record<string, BadgeTone> = {
  scheduled: 'warning',
  confirmed: 'success',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'danger',
};

export function appointmentToneOf(status: string | null | undefined): BadgeTone {
  return status ? (APPOINTMENT_TONES[status] ?? 'neutral') : 'neutral';
}

/** Transitions proposées au technicien ; un rendez-vous sans statut est considéré planifié. */
const NEXT_STATUSES: Record<string, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function nextAppointmentStatuses(status: string | null | undefined): AppointmentStatus[] {
  return NEXT_STATUSES[status ?? 'scheduled'] ?? [];
}

/** Heure au format `HH:MM` ; le serveur renvoie parfois `HH:MM:SS`. */
export function normalizeTime(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : '';
}

export interface DaySlots<T> {
  day: number;
  slots: T[];
}

/** Créneaux regroupés par jour, dans l'ordre de la semaine ; les jours vides sont omis. */
export function groupSlotsByDay<T extends { day_of_week: number; start_time?: string | null }>(
  slots: T[],
): DaySlots<T>[] {
  return DAY_ORDER.map((day) => ({
    day,
    slots: slots
      .filter((slot) => slot.day_of_week === day)
      .sort((left, right) =>
        normalizeTime(left.start_time).localeCompare(normalizeTime(right.start_time)),
      ),
  })).filter((group) => group.slots.length > 0);
}
