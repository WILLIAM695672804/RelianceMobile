import appointmentCreated from '@/test/fixtures/planning/appointment-created.json';
import appointments from '@/test/fixtures/planning/appointments.json';
import appointmentsUpcoming from '@/test/fixtures/planning/appointments-upcoming.json';
import calendar from '@/test/fixtures/planning/calendar.json';
import exceptionCreated from '@/test/fixtures/planning/exception-created.json';
import slotCreated from '@/test/fixtures/planning/slot-created.json';

import {
  appointmentFormSchema,
  appointmentListResponseSchema,
  appointmentPageSchema,
  appointmentResponseSchema,
  calendarResponseSchema,
  exceptionFormSchema,
  exceptionResponseSchema,
  slotFormSchema,
  slotResponseSchema,
  toAppointmentPayload,
  toExceptionPayload,
  toSlotPayload,
} from './planningSchemas';

describe('planningSchemas', () => {
  it('lit le calendrier, ses créneaux et ses indicateurs', () => {
    const parsed = calendarResponseSchema.parse(calendar).data;

    expect(parsed.schedule_id).toBe(calendar.data.schedule_id);
    expect(parsed.recurring_slots).toHaveLength(calendar.data.recurring_slots.length);
    expect(parsed.recurring_slots[0]?.start_time).toBe('09:00');
    expect(parsed.exceptions).toHaveLength(calendar.data.exceptions.length);
    expect(parsed.insights?.capacity_percent).toBe(calendar.data.insights.capacity_percent);
  });

  it('lit un créneau et une indisponibilité créés', () => {
    expect(slotResponseSchema.parse(slotCreated).data.start_time).toBe('08:00');
    expect(exceptionResponseSchema.parse(exceptionCreated).data.reason).toBe(
      exceptionCreated.data.reason,
    );
  });

  it('lit les rendez-vous, dont le statut absent à la création', () => {
    expect(appointmentResponseSchema.parse(appointmentCreated).data.status).toBeNull();
    expect(appointmentPageSchema.parse(appointments).data).toHaveLength(appointments.data.length);
    expect(appointmentListResponseSchema.parse(appointmentsUpcoming).data).toHaveLength(
      appointmentsUpcoming.data.length,
    );
  });

  it('valide un créneau hebdomadaire', () => {
    const valid = { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' };
    expect(slotFormSchema.safeParse(valid).success).toBe(true);
    expect(slotFormSchema.safeParse({ ...valid, startTime: '8h' }).error?.issues[0]?.message).toBe(
      'planning:slots.errors.timeInvalid',
    );
    expect(slotFormSchema.safeParse({ ...valid, endTime: '07:00' }).error?.issues[0]?.message).toBe(
      'planning:slots.errors.endBeforeStart',
    );
    expect(toSlotPayload(valid)).toEqual({
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '17:00',
      repeatWeekly: true,
    });
  });

  it('valide une indisponibilité et construit ses horodatages', () => {
    const valid = { startDate: '2026-10-09', endDate: '2026-10-10', reason: 'Congé' };
    expect(exceptionFormSchema.safeParse(valid).success).toBe(true);
    expect(
      exceptionFormSchema.safeParse({ ...valid, startDate: '09/10/2026' }).error?.issues[0]
        ?.message,
    ).toBe('planning:exceptions.errors.dateInvalid');
    expect(
      exceptionFormSchema.safeParse({ ...valid, endDate: '2026-10-08' }).error?.issues[0]?.message,
    ).toBe('planning:exceptions.errors.endBeforeStart');
    expect(toExceptionPayload(valid)).toEqual({
      startTs: '2026-10-09T00:00:00',
      endTs: '2026-10-10T23:59:00',
      reason: 'Congé',
    });
    expect(toExceptionPayload({ ...valid, reason: '  ' }).reason).toBeNull();
  });

  it('valide un rendez-vous et construit sa charge utile', () => {
    const valid = { date: '2026-10-09', time: '09:00', notes: 'Prévoir l’échelle' };
    expect(appointmentFormSchema.safeParse(valid).success).toBe(true);
    expect(
      appointmentFormSchema.safeParse({ ...valid, time: '25:00' }).error?.issues[0]?.message,
    ).toBe('planning:appointments.errors.timeInvalid');
    expect(toAppointmentPayload('r1', 't1', valid)).toEqual({
      requestId: 'r1',
      technicianId: 't1',
      scheduledStart: '2026-10-09T09:00:00',
      scheduledEnd: '2026-10-09T11:00:00',
      notes: 'Prévoir l’échelle',
    });
    expect(
      toAppointmentPayload('r1', 't1', { date: '2026-10-09', time: '23:00', notes: '' })
        .scheduledEnd,
    ).toBe('2026-10-10T01:00:00');
  });
});
