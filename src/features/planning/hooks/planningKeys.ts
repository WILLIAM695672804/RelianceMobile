/** Clés de cache de la feature `planning`. */
export const planningKeys = {
  all: ['planning'] as const,
  calendar: () => [...planningKeys.all, 'calendar'] as const,
  appointments: () => [...planningKeys.all, 'appointments'] as const,
  upcoming: () => [...planningKeys.appointments(), 'upcoming'] as const,
  appointment: (appointmentId: string) =>
    [...planningKeys.appointments(), 'detail', appointmentId] as const,
};
