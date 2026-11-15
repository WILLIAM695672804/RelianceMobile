/** Clés de cache de la feature `reviews`. */
export const reviewsKeys = {
  all: ['reviews'] as const,
  technician: (technicianId: string) => [...reviewsKeys.all, 'technician', technicianId] as const,
  mine: () => [...reviewsKeys.all, 'mine'] as const,
  badges: (userId: string) => [...reviewsKeys.all, 'badges', userId] as const,
  reputation: (userId: string) => [...reviewsKeys.all, 'reputation', userId] as const,
  catalog: () => [...reviewsKeys.all, 'catalog'] as const,
};
