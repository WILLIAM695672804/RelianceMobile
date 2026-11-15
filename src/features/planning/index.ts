/**
 * Feature `planning` — disponibilités du technicien (E25) et rendez-vous.
 * @packageDocumentation
 */

export { planningKeys } from './hooks/planningKeys';
export {
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
} from './hooks/usePlanning';
export { planningTranslations } from './i18n';
export {
  appointmentToneOf,
  DAY_ORDER,
  groupSlotsByDay,
  nextAppointmentStatuses,
  normalizeTime,
  type AppointmentStatus,
} from './model/schedule';
export { AppointmentsScreen } from './screens/AppointmentsScreen';
export { ExceptionsScreen } from './screens/ExceptionsScreen';
export {
  NewAppointmentScreen,
  type NewAppointmentScreenProps,
} from './screens/NewAppointmentScreen';
export { PlanningScreen, type PlanningScreenProps } from './screens/PlanningScreen';
export { TimeSlotsScreen } from './screens/TimeSlotsScreen';
export type { Appointment, Calendar, ScheduleException, TimeSlot } from './schemas/planningSchemas';
export {
  AvailabilityView,
  BlockAgendaView,
  daysBetween,
  PlanningWeekView,
  type AgendaEvent,
  type AgendaKind,
  type AvailabilityValues,
  type BlockReason,
  type BlockValues,
  type WeeklyHours,
} from './ui/PlanningViews';
