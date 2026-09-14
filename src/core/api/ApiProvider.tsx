import type { AxiosInstance } from 'axios';
import { createContext, useContext, type ReactNode } from 'react';

const ApiClientContext = createContext<AxiosInstance | null>(null);

/** Met le client HTTP de l'API à disposition des hooks des features. */
export function ApiProvider({ client, children }: { client: AxiosInstance; children: ReactNode }) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

/** Client HTTP de l'API `/api/v1`. */
export function useApiClient(): AxiosInstance {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error('useApiClient doit être utilisé sous <ApiProvider>.');
  return client;
}
