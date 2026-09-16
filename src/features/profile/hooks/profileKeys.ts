/** Clés de cache de la feature `profile`. */
export const profileKeys = {
  all: ['profile'] as const,
  locations: () => [...profileKeys.all, 'locations'] as const,
  skills: () => [...profileKeys.all, 'skills'] as const,
};
