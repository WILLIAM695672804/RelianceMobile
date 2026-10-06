import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  appointmentListResponseSchema,
  appointmentPageSchema,
  appointmentResponseSchema,
  calendarResponseSchema,
  exceptionResponseSchema,
  slotResponseSchema,
  type Appointment,
  type AppointmentPayload,
  type Calendar,
  type ExceptionPayload,
  type ScheduleException,
  type SlotPayload,
  type TimeSlot,
} from '../schemas/planningSchemas';

const segment = encodeURIComponent;
const appointment = (data: unknown): Appointment =>
  parseResponse(appointmentResponseSchema, data).data;

/** `GET /technician/calendar` : créneaux, indisponibilités, rendez-vous et charge. */
export async function fetchCalendar(client: AxiosInstance): Promise<Calendar> {
  const { data } = await client.get('/technician/calendar');
  return parseResponse(calendarResponseSchema, data).data;
}

/** `POST /technician/time-slots`. */
export async function createTimeSlot(
  client: AxiosInstance,
  payload: SlotPayload,
): Promise<TimeSlot> {
  const { data } = await client.post('/technician/time-slots', {
    day_of_week: payload.dayOfWeek,
    start_time: payload.startTime,
    end_time: payload.endTime,
    repeat_weekly: payload.repeatWeekly,
  });
  return parseResponse(slotResponseSchema, data).data;
}

/** `DELETE /technician/time-slots/{id}`. */
export async function deleteTimeSlot(client: AxiosInstance, slotId: string): Promise<void> {
  await client.delete(`/technician/time-slots/${segment(slotId)}`);
}

/** `POST /technician/exceptions`. */
export async function createException(
  client: AxiosInstance,
  payload: ExceptionPayload,
): Promise<ScheduleException> {
  const body: Record<string, unknown> = { start_ts: payload.startTs, end_ts: payload.endTs };
  if (payload.reason) body.reason = payload.reason;
  const { data } = await client.post('/technician/exceptions', body);
  return parseResponse(exceptionResponseSchema, data).data;
}

/** `DELETE /technician/exceptions/{id}`. */
export async function deleteException(client: AxiosInstance, exceptionId: string): Promise<void> {
  await client.delete(`/technician/exceptions/${segment(exceptionId)}`);
}

/** `GET /appointments` : rendez-vous du technicien et des demandes du client. */
export async function fetchAppointments(client: AxiosInstance): Promise<Appointment[]> {
  const { data } = await client.get('/appointments');
  return parseResponse(appointmentPageSchema, data).data;
}

/** `GET /appointments/upcoming` : dix prochains rendez-vous du technicien. */
export async function fetchUpcomingAppointments(client: AxiosInstance): Promise<Appointment[]> {
  const { data } = await client.get('/appointments/upcoming');
  return parseResponse(appointmentListResponseSchema, data).data;
}

/** `GET /appointments/{id}`. */
export async function fetchAppointment(
  client: AxiosInstance,
  appointmentId: string,
): Promise<Appointment> {
  const { data } = await client.get(`/appointments/${segment(appointmentId)}`);
  return appointment(data);
}

/** `POST /appointments`. */
export async function createAppointment(
  client: AxiosInstance,
  payload: AppointmentPayload,
): Promise<Appointment> {
  const body: Record<string, unknown> = {
    request_id: payload.requestId,
    technician_id: payload.technicianId,
    scheduled_start: payload.scheduledStart,
    scheduled_end: payload.scheduledEnd,
  };
  if (payload.notes) body.notes = payload.notes;
  const { data } = await client.post('/appointments', body);
  return appointment(data);
}

/** `PATCH /appointments/{id}/status`. */
export async function updateAppointmentStatus(
  client: AxiosInstance,
  appointmentId: string,
  status: string,
): Promise<Appointment> {
  const { data } = await client.patch(`/appointments/${segment(appointmentId)}/status`, {
    status,
  });
  return appointment(data);
}
