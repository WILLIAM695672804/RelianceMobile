import { renderHook } from '@testing-library/react-native';
import axios from 'axios';
import type { ReactNode } from 'react';

import { ApiProvider, useApiClient } from './ApiProvider';

describe('ApiProvider', () => {
  it('expose le client HTTP fourni', async () => {
    const client = axios.create();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiProvider client={client}>{children}</ApiProvider>
    );

    const { result } = await renderHook(() => useApiClient(), { wrapper });

    expect(result.current).toBe(client);
  });

  it('refuse un usage hors fournisseur', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useApiClient())).rejects.toThrow(
      'useApiClient doit être utilisé sous <ApiProvider>.',
    );
    jest.restoreAllMocks();
  });
});
