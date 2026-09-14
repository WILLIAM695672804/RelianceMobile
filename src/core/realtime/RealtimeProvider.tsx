import { createContext, useContext, type ReactNode } from 'react';

import type { RealtimeService } from './realtimeService';

const RealtimeContext = createContext<RealtimeService | null>(null);

export function RealtimeProvider({
  service,
  children,
}: {
  service: RealtimeService;
  children: ReactNode;
}) {
  return <RealtimeContext.Provider value={service}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeService {
  const service = useContext(RealtimeContext);
  if (!service) throw new Error('useRealtime doit être utilisé sous <RealtimeProvider>.');
  return service;
}
