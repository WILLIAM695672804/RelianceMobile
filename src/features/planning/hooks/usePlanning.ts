import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

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
} from '../api/planningApi';
import type { AppointmentPayload, ExceptionPayload, SlotPayload } from '../schemas/planningSchemas';
import { planningKeys } from './planningKeys';

export function useCalendar() {
  const api = useApiClient();
  return useQuery({ queryKey: planningKeys.calendar(), queryFn: () => fetchCalendar(api) });
}

export function useAppointments() {
  const api = useApiClient();
  return useQuery({
    queryKey: planningKeys.appointments(),
    queryFn: () => fetchAppointments(api),
  });
}

export function useUpcomingAppointments() {
  const api = useApiClient();
  return useQuery({
    queryKey: planningKeys.upcoming(),
    queryFn: () => fetchUpcomingAppointments(api),
  });
}

export function useAppointment(appointmentId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: planningKeys.appointment(appointmentId),
    queryFn: () => fetchAppointment(api, appointmentId),
  });
}

/** Toute écriture recharge calendrier et rendez-vous. */
function usePlanningInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: planningKeys.all });
}

export function useCreateTimeSlot() {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (payload: SlotPayload) => createTimeSlot(api, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTimeSlot() {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (slotId: string) => deleteTimeSlot(api, slotId),
    onSuccess: invalidate,
  });
}

export function useCreateException() {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (payload: ExceptionPayload) => createException(api, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteException() {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (exceptionId: string) => deleteException(api, exceptionId),
    onSuccess: invalidate,
  });
}

export function useCreateAppointment() {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(api, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAppointmentStatus(appointmentId: string) {
  const api = useApiClient();
  const invalidate = usePlanningInvalidation();
  return useMutation({
    mutationFn: (status: string) => updateAppointmentStatus(api, appointmentId, status),
    onSuccess: invalidate,
  });
}
