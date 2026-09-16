/** Clés de cache de la feature `auth`. */
export const authKeys = {
  all: ['auth'] as const,
  account: () => [...authKeys.all, 'account'] as const,
};
