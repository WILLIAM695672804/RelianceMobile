import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import axios, { type AxiosInstance } from 'axios';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ApiProvider } from '@/core/api';
import { createI18n, type TranslationResources } from '@/core/i18n';
import { createRealtimeService, RealtimeProvider, type RealtimeService } from '@/core/realtime';
import {
  createSessionStore,
  SessionProvider,
  type SessionActions,
  type SessionStore,
} from '@/core/session';
import { ThemeProvider } from '@/core/theme';

import { createFakeRealtimeClient } from './fakeRealtime';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export interface TestProvidersOptions {
  queryClient?: QueryClient;
  api?: AxiosInstance;
  sessionStore?: SessionStore;
  sessionActions?: Partial<SessionActions>;
  realtime?: RealtimeService;
  translations?: TranslationResources[];
}

/** Fournisseurs de l'application avec des dépendances de test remplaçables. */
export function createTestProviders(options: TestProvidersOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const api = options.api ?? axios.create({ baseURL: 'http://api.test/api/v1' });
  const sessionStore = options.sessionStore ?? createSessionStore();
  const sessionActions: SessionActions = {
    restore: jest.fn(async () => 'unauthenticated' as const),
    signIn: jest.fn(),
    logout: jest.fn(async () => undefined),
    ...options.sessionActions,
  };
  const realtime =
    options.realtime ?? createRealtimeService(() => createFakeRealtimeClient().client);
  const i18n = createI18n(options.translations ?? [], 'fr');

  function TestProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider scheme="light">
            <SessionProvider store={sessionStore} actions={sessionActions}>
              <ApiProvider client={api}>
                <RealtimeProvider service={realtime}>{children}</RealtimeProvider>
              </ApiProvider>
            </SessionProvider>
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    );
  }

  return { TestProviders, queryClient, api, sessionStore, sessionActions, realtime, i18n };
}

/** `render` de RNTL enveloppé dans les fournisseurs de test. */
export async function renderWithProviders(ui: ReactElement, options?: TestProvidersOptions) {
  const providers = createTestProviders(options);
  const result = await render(ui, { wrapper: providers.TestProviders });
  return { ...result, ...providers };
}
