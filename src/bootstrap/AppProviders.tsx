import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiProvider } from '@/core/api';
import { RealtimeProvider } from '@/core/realtime';
import { SessionProvider } from '@/core/session';
import { ThemeProvider } from '@/core/theme';
import { ToastProvider } from '@/shared/ui';

import type { AppServices } from './createServices';

/** Fournisseurs racine : cache persisté, i18n, thème, session, API, temps réel, toasts. */
export function AppProviders({
  services,
  children,
}: {
  services: AppServices;
  children: ReactNode;
}) {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={services.queryClient}
        persistOptions={services.persistOptions}
        onSuccess={() => services.queryClient.resumePausedMutations()}
      >
        <I18nextProvider i18n={services.i18n}>
          <ThemeProvider>
            <SessionProvider store={services.sessionStore} actions={services.sessionActions}>
              <ApiProvider client={services.api}>
                <RealtimeProvider service={services.realtime}>
                  <ToastProvider>{children}</ToastProvider>
                </RealtimeProvider>
              </ApiProvider>
            </SessionProvider>
          </ThemeProvider>
        </I18nextProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
