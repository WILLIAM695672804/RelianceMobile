import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import kycMine from '@/test/fixtures/kyc/kyc-mine.json';
import kycStatusChanged from '@/test/fixtures/kyc/kyc-status-changed.json';
import kycUploaded from '@/test/fixtures/kyc/kyc-uploaded.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { kycKeys } from './kycKeys';
import { useKycDocuments, useKycStatusSync, useUploadKycDocument } from './useKyc';

function setup() {
  const fake = createFakeRealtimeClient();
  const realtime = createRealtimeService(() => fake.client);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { id: 'u1' }));
  realtime.start();
  const providers = createTestProviders({ realtime, sessionStore });
  return {
    ...providers,
    fake,
    mock: new MockAdapter(providers.api),
    wrapper: providers.TestProviders,
  };
}

describe('hooks kyc', () => {
  it('kycKeys hiérarchise les clés sous « kyc »', () => {
    expect(kycKeys.mine()).toEqual(['kyc', 'mine']);
  });

  it('useKycDocuments lit les justificatifs', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/auth/kyc/mine').reply(200, kycMine);

    const { result } = await renderHook(() => useKycDocuments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useUploadKycDocument invalide la liste', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/auth/kyc/upload').reply(200, kycUploaded);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useUploadKycDocument(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        type: 'cni',
        file: { uri: 'file:///cni.jpg', name: 'cni.jpg', type: 'image/jpeg' },
      });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: kycKeys.all });
  });

  it('useKycStatusSync invalide les justificatifs à l’événement KycStatusChanged', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useKycStatusSync(), { wrapper });
    await act(async () => {
      fake.channels.get('user.u1')?.emit('KycStatusChanged', kycStatusChanged);
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: kycKeys.all });
  });
});
