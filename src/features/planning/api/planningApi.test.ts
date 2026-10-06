import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import appointmentConfirmed from '@/test/fixtures/planning/appointment-confirmed.json';
import appointmentCreated from '@/test/fixtures/planning/appointment-created.json';
import appointment from '@/test/fixtures/planning/appointment.json';
import appointments from '@/test/fixtures/planning/appointments.json';
import appointmentsUpcoming from '@/test/fixtures/planning/appointments-upcoming.json';
import calendar from '@/test/fixtures/planning/calendar.json';
import exceptionCreated from '@/test/fixtures/planning/exception-created.json';
import exceptionDeleted from '@/test/fixtures/planning/exception-deleted.json';
import slotCreated from '@/test/fixtures/planning/slot-created.json';
import slotDeleted from '@/test/fixtures/planning/slot-deleted.json';

import {
  createAppointment,
  createException,
  createTimeSlot,
  deleteException,
  deleteTimeSlot,
  fetchAppointment,
  fetchAppointments,
  fetchCalendar,
  fetchUpcomingAppointments,
  updateAppointmentStatus,
} from './planningApi';

const SLOT_ID = slotCreated.data.id;
const EXCEPTION_ID = exceptionCreated.data.id;
const APPOINTMENT_ID = appointment.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('planningApi', () => {
  it('lit le calendrier et les rendez-vous', async () => {
    const { client, mock } = setup();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onGet('/appointments').reply(200, appointments);
    mock.onGet('/appointments/upcoming').reply(200, appointmentsUpcoming);
    mock.onGet(`/appointments/${APPOINTMENT_ID}`).reply(200, appointment);

    await expect(fetchCalendar(client)).resolves.toMatchObject({
      schedule_id: calendar.data.schedule_id,
    });
    await expect(fetchAppointments(client)).resolves.toHaveLength(appointments.data.length);
    await expect(fetchUpcomingAppointments(client)).resolves.toHaveLength(
      appointmentsUpcoming.data.length,
    );
    await expect(fetchAppointment(client, APPOINTMENT_ID)).resolves.toMatchObject({
      id: APPOINTMENT_ID,
    });
  });

  it('crée un créneau et une indisponibilité au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/technician/time-slots').reply(201, slotCreated);
    mock.onPost('/technician/exceptions').reply(201, exceptionCreated);

    await createTimeSlot(client, {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '17:00',
      repeatWeekly: true,
    });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      day_of_week: 1,
      start_time: '08:00',
      end_time: '17:00',
      repeat_weekly: true,
    });

    await createException(client, {
      startTs: '2026-10-09T00:00:00',
      endTs: '2026-10-10T23:59:00',
      reason: 'Congé',
    });
    expect(JSON.parse(mock.history.post[1]?.data as string)).toEqual({
      start_ts: '2026-10-09T00:00:00',
      end_ts: '2026-10-10T23:59:00',
      reason: 'Congé',
    });
  });

  it('supprime un créneau et une indisponibilité', async () => {
    const { client, mock } = setup();
    mock.onDelete(`/technician/time-slots/${SLOT_ID}`).reply(200, slotDeleted);
    mock.onDelete(`/technician/exceptions/${EXCEPTION_ID}`).reply(200, exceptionDeleted);

    await expect(deleteTimeSlot(client, SLOT_ID)).resolves.toBeUndefined();
    await expect(deleteException(client, EXCEPTION_ID)).resolves.toBeUndefined();
  });

  it('planifie un rendez-vous et fait évoluer son statut', async () => {
    const { client, mock } = setup();
    mock.onPost('/appointments').reply(201, appointmentCreated);
    mock.onPatch(`/appointments/${APPOINTMENT_ID}/status`).reply(200, appointmentConfirmed);

    await expect(
      createAppointment(client, {
        requestId: 'r1',
        technicianId: 't1',
        scheduledStart: '2026-10-09T09:00:00',
        scheduledEnd: '2026-10-09T11:00:00',
        notes: null,
      }),
    ).resolves.toMatchObject({ id: appointmentCreated.data.id });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: 'r1',
      technician_id: 't1',
      scheduled_start: '2026-10-09T09:00:00',
      scheduled_end: '2026-10-09T11:00:00',
    });

    await updateAppointmentStatus(client, APPOINTMENT_ID, 'confirmed');
    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({ status: 'confirmed' });
  });
});
