/** Clés de cache de la feature `agency`. */
export const agencyKeys = {
  all: ['agency'] as const,
  mine: () => [...agencyKeys.all, 'mine'] as const,
  detail: (agencyId: string) => [...agencyKeys.all, 'detail', agencyId] as const,
  members: (agencyId: string) => [...agencyKeys.all, 'members', agencyId] as const,
};
