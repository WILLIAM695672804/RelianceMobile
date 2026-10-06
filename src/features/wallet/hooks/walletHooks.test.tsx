import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import transactions from '@/test/fixtures/wallet/transactions.json';
import wallet from '@/test/fixtures/wallet/wallet.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { walletKeys } from './walletKeys';
import {
  useRechargeWallet,
  useRequestWithdrawal,
  useWallet,
  useWalletSync,
  useWalletTransactions,
} from './useWallet';

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

describe('hooks du portefeuille', () => {
  it('hiérarchise les clés sous « wallet »', () => {
    expect(walletKeys.wallet()).toEqual(['wallet', 'detail']);
    expect(walletKeys.transactions()).toEqual(['wallet', 'transactions']);
  });

  it('lit le portefeuille et l’historique', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/wallet').reply(200, wallet);
    mock.onGet('/wallet/transactions').reply(200, transactions);

    const hooks = [
      await renderHook(() => useWallet(), { wrapper }),
      await renderHook(() => useWalletTransactions(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les demandes de paiement rechargent le portefeuille', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/wallet/recharge').reply(200, { message: 'Paiement initié', status: 'pending' });
    mock.onPost('/wallet/withdraw').reply(200, { message: 'Demande de retrait enregistrée' });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const recharge = await renderHook(() => useRechargeWallet(), { wrapper });
    const withdrawal = await renderHook(() => useRequestWithdrawal(), { wrapper });

    await act(async () => {
      await recharge.result.current.mutateAsync({
        amount: 5000,
        method: 'momo',
        phoneNumber: '600000000',
      });
      await withdrawal.result.current.mutateAsync({
        amount: 1000,
        method: 'card',
        phoneNumber: null,
      });
    });
    await waitFor(() => expect(withdrawal.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.all });
  });

  it('useWalletSync recharge le portefeuille aux événements du canal', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useWalletSync(), { wrapper });

    for (const event of ['BalanceUpdated', 'HoldCaptured', 'HoldReleased', 'PaymentSettled']) {
      invalidate.mockClear();
      await act(async () => {
        fake.channels.get('wallet.u1')?.emit(event, { amount: 1000 });
      });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.all });
    }
  });
});
