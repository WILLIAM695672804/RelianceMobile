/** Clés de cache de la feature `requests`. */
export const requestsKeys = {
  all: ['requests'] as const,
  list: () => [...requestsKeys.all, 'list'] as const,
  detail: (id: string) => [...requestsKeys.all, 'detail', id] as const,
};
