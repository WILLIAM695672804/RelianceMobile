/** Clés de cache de la feature `missions`. */
export const missionsKeys = {
  all: ['missions'] as const,
  list: (status?: string) => [...missionsKeys.all, 'list', status ?? null] as const,
  detail: (jobId: string) => [...missionsKeys.all, 'detail', jobId] as const,
  tracking: (jobId: string) => [...missionsKeys.all, 'tracking', jobId] as const,
  clientMission: () => [...missionsKeys.all, 'client-mission'] as const,
  technicianPosition: () => [...missionsKeys.all, 'technician-position'] as const,
};
