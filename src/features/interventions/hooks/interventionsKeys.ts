/** Clés de cache de la feature `interventions`. */
export const interventionsKeys = {
  all: ['interventions'] as const,
  list: () => [...interventionsKeys.all, 'list'] as const,
  detail: (id: string) => [...interventionsKeys.all, 'detail', id] as const,
};
