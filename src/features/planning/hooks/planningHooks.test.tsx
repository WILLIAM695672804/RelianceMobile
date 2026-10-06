import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import appointmentConfirmed from '@/test/fixtures/planning/appointment-confirmed.json';
import appointmentCreated from '@/test/fixtures/planning/appointment-created.json';
import appointments from '@/test/fixtures/planning/appointments.json';
import appointmentsUpcoming from '@/test/fixtures/planning/appointments-upcoming.json';
import calendar from '@/test/fixtures/planning/calendar.json';
import exceptionCreated from '@/test/fixtures/planning/exception-created.json';
import exceptionDeleted from '@/test/fixtures/planning/exception-deleted.json';
import slotCreated from '@/test/fixtures/planning/slot-created.json';
import slotDeleted from '@/test/fixtures/planning/slot-deleted.json';
import { createTestProviders } from '@/test/render';

import { planningKeys } from './planningKeys';
import {
  useAppointment,
  useAppointments,
  useCalendar,
  useCreateAppointment,
  useCreateException,
  useCreateTimeSlot,
  useDeleteException,
  useDeleteTimeSlot,
  useUpcomingAppointments,
  useUpdateAppointmentStatus,
} from './usePlanning';

const APPOINTMENT_ID = appointmentCreated.data.id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks du planning', () => {
  it('hiérarchise les clés sous « planning »', () => {
    expect(planningKeys.calendar()).toEqual(['planning', 'calendar']);
    expect(planningKeys.appointments()).toEqual(['planning', 'appointments']);
    expect(planningKeys.upcoming()).toEqual(['planning', 'appointments', 'upcoming']);
    expect(planningKeys.appointment('a1')).toEqual(['planning', 'appointments', 'detail', 'a1']);
  });

  it('lit le calendrier et les rendez-vous', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onGet('/appointments').reply(200, appointments);
    mock.onGet('/appointments/upcoming').reply(200, appointmentsUpcoming);
    mock.onGet(`/appointments/${APPOINTMENT_ID}`).reply(200, appointmentCreated);

    const hooks = [
      await renderHook(() => useCalendar(), { wrapper }),
      await renderHook(() => useAppointments(), { wrapper }),
      await renderHook(() => useUpcomingAppointments(), { wrapper }),
      await renderHook(() => useAppointment(APPOINTMENT_ID), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent le planning', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/technician/time-slots').reply(201, slotCreated);
    mock.onDelete(`/technician/time-slots/${slotCreated.data.id}`).reply(200, slotDeleted);
    mock.onPost('/technician/exceptions').reply(201, exceptionCreated);
    mock
      .onDelete(`/technician/exceptions/${exceptionCreated.data.id}`)
      .reply(200, exceptionDeleted);
    mock.onPost('/appointments').reply(201, appointmentCreated);
    mock.onPatch(`/appointments/${APPOINTMENT_ID}/status`).reply(200, appointmentConfirmed);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const createSlot = await renderHook(() => useCreateTimeSlot(), { wrapper });
    const removeSlot = await renderHook(() => useDeleteTimeSlot(), { wrapper });
    const createException = await renderHook(() => useCreateException(), { wrapper });
    const removeException = await renderHook(() => useDeleteException(), { wrapper });
    const createAppointment = await renderHook(() => useCreateAppointment(), { wrapper });
    const updateStatus = await renderHook(() => useUpdateAppointmentStatus(APPOINTMENT_ID), {
      wrapper,
    });

    await act(async () => {
      await createSlot.result.current.mutateAsync({
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '17:00',
        repeatWeekly: true,
      });
      await removeSlot.result.current.mutateAsync(slotCreated.data.id);
      await createException.result.current.mutateAsync({
        startTs: '2026-10-09T00:00:00',
        endTs: '2026-10-10T23:59:00',
        reason: null,
      });
      await removeException.result.current.mutateAsync(exceptionCreated.data.id);
      await createAppointment.result.current.mutateAsync({
        requestId: 'r1',
        technicianId: 't1',
        scheduledStart: '2026-10-09T09:00:00',
        scheduledEnd: '2026-10-09T11:00:00',
        notes: null,
      });
      await updateStatus.result.current.mutateAsync('confirmed');
    });
    await waitFor(() => expect(updateStatus.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: planningKeys.all });
    expect(invalidate).toHaveBeenCalledTimes(6);
  });
});
