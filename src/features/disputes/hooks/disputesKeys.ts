/** Clés de cache de la feature `disputes`. */
export const disputesKeys = {
  all: ['disputes'] as const,
  list: () => [...disputesKeys.all, 'list'] as const,
  detail: (id: string) => [...disputesKeys.all, 'detail', id] as const,
};
