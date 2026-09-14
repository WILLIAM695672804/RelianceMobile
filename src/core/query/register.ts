import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: Record<string, unknown> & {
      /** Persister cette requête dans MMKV (mode hors ligne). */
      persist?: boolean;
    };
  }
}
