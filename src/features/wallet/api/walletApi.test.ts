import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import transactions from '@/test/fixtures/wallet/transactions.json';
import wallet from '@/test/fixtures/wallet/wallet.json';

import { fetchTransactions, fetchWallet, rechargeWallet, requestWithdrawal } from './walletApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('walletApi', () => {
  it('lit le portefeuille et son historique', async () => {
    const { client, mock } = setup();
    mock.onGet('/wallet').reply(200, wallet);
    mock.onGet('/wallet/transactions').reply(200, transactions);

    await expect(fetchWallet(client)).resolves.toMatchObject({ id: wallet.data.id });
    await expect(fetchTransactions(client)).resolves.toEqual([]);
  });

  it('demande une recharge au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/wallet/recharge').reply(200, { message: 'Paiement initié', status: 'pending' });

    await expect(
      rechargeWallet(client, { amount: 5000, method: 'momo', phoneNumber: '600000000' }),
    ).resolves.toMatchObject({ status: 'pending' });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      amount: 5000,
      method: 'momo',
      phone_number: '600000000',
    });
  });

  it('omet le téléphone pour les autres moyens', async () => {
    const { client, mock } = setup();
    mock.onPost('/wallet/withdraw').reply(200, { message: 'Demande de retrait enregistrée' });

    await requestWithdrawal(client, { amount: 1000, method: 'card', phoneNumber: null });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      amount: 1000,
      method: 'card',
    });
  });
});
