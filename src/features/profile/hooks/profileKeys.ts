/** Clés de cache de la feature `profile`. */
export const profileKeys = {
  all: ['profile'] as const,
  locations: () => [...profileKeys.all, 'locations'] as const,
  skills: () => [...profileKeys.all, 'skills'] as const,
  technician: () => [...profileKeys.all, 'technician'] as const,
  technicianIdentity: () => [...profileKeys.technician(), 'identity'] as const,
  technicianSkills: () => [...profileKeys.technician(), 'skills'] as const,
  technicianStats: () => [...profileKeys.technician(), 'stats'] as const,
};
