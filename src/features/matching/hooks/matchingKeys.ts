/** Clés de cache de la feature `matching`. */
export const matchingKeys = {
  all: ['matching'] as const,
  matches: (requestId: string) => [...matchingKeys.all, 'matches', requestId] as const,
  technician: (technicianId: string) => [...matchingKeys.all, 'technician', technicianId] as const,
  proposals: () => [...matchingKeys.all, 'proposals'] as const,
  activeMission: () => [...matchingKeys.all, 'active-mission'] as const,
};
