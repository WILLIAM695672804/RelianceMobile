import { renderHook } from '@testing-library/react-native';
import axios from 'axios';
import type { ReactNode } from 'react';

import { ApiProvider } from './ApiProvider';
import { resolveStorageUrl, useStorageUrl } from './storage';

describe('resolveStorageUrl', () => {
  it('construit l’URL publique à partir de l’origine de l’API', () => {
    expect(resolveStorageUrl('http://api.test/api/v1', 'requests/photos/a.png')).toBe(
      'http://api.test/storage/requests/photos/a.png',
    );
    expect(resolveStorageUrl('http://api.test/api/v1/', '/requests/photos/a.png')).toBe(
      'http://api.test/storage/requests/photos/a.png',
    );
  });

  it('conserve une URL déjà absolue', () => {
    expect(resolveStorageUrl('http://api.test/api/v1', 'https://cdn.test/a.png')).toBe(
      'https://cdn.test/a.png',
    );
  });

  it('useStorageUrl utilise l’adresse du client API courant', async () => {
    const client = axios.create({ baseURL: 'http://api.test/api/v1' });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiProvider client={client}>{children}</ApiProvider>
    );

    const { result } = await renderHook(() => useStorageUrl(), { wrapper });

    expect(result.current('requests/photos/b.png')).toBe(
      'http://api.test/storage/requests/photos/b.png',
    );
  });
});
