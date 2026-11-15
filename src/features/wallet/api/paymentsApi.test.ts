import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import payment from '@/test/fixtures/wallet/payment.json';
import settled from '@/test/fixtures/wallet/payment-settled.json';

import { confirmPayment, fetchPayment } from './paymentsApi';

const ID = payment.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('paymentsApi', () => {
  it('lit un paiement en attente et sa référence', async () => {
    const { client, mock } = setup();
    mock.onGet(`/payments/${ID}`).reply(200, payment);

    const parsed = await fetchPayment(client, ID);

    expect(parsed.status).toBe('pending');
    expect(parsed.external_ref).toBe(payment.data.external_ref);
    expect(parsed.amount).toBe(payment.data.amount);
  });

  it('lit un paiement réglé', async () => {
    const { client, mock } = setup();
    mock.onGet(`/payments/${ID}`).reply(200, settled);

    await expect(fetchPayment(client, ID)).resolves.toMatchObject({ status: 'settled' });
  });

  it('confirme un paiement sans corps', async () => {
    const { client, mock } = setup();
    mock.onPost(`/payments/${ID}/confirm`).reply(200, { message: 'Paiement confirmé' });

    await confirmPayment(client, ID);

    expect(mock.history.post[0]?.url).toBe(`/payments/${ID}/confirm`);
    expect(mock.history.post[0]?.data).toBe('{}');
  });
});
