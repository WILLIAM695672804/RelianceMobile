import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';

import { useApiClient } from '@/core/api';
import { useRealtime } from '@/core/realtime';
import { useSession } from '@/core/session';
import { useTheme } from '@/core/theme';
import { Text } from '@/shared/ui';
import { createMemoryStore } from '@/core/storage';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import { testEnv } from '@/test/fixtures/env';

import { AppProviders } from './AppProviders';
import { createServices } from './createServices';

function Probe() {
  const { t } = useTranslation();
  const status = useSession((state) => state.status);
  useApiClient();
  useRealtime();
  useQueryClient();
  const theme = useTheme();
  return <Text>{`${t('common:appName')}|${status}|${theme.scheme.length > 0}`}</Text>;
}

describe('AppProviders', () => {
  it('met tous les services à disposition de l’arbre', async () => {
    const services = createServices({
      env: testEnv,
      cookies: {
        get: async () => undefined,
        flush: async () => undefined,
        clearAll: async () => undefined,
      },
      sessionStorage: createMemoryStore(),
      cacheStorage: createMemoryStore(),
      appVersion: '0.1.0',
      language: 'fr',
      realtimeFactory: () => createFakeRealtimeClient().client,
    });

    await render(
      <AppProviders services={services}>
        <Probe />
      </AppProviders>,
    );

    expect(await screen.findByText('Reliance|unknown|true')).toBeOnTheScreen();
  });
});
