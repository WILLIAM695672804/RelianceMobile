import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import captured from '@/test/fixtures/wallet/hold-captured.json';
import created from '@/test/fixtures/wallet/hold-created.json';
import released from '@/test/fixtures/wallet/hold-released.json';
import holds from '@/test/fixtures/wallet/holds.json';

import { captureHold, fetchHolds, placeHold, releaseHold } from './holdsApi';

const ID = holds.data[0]!.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('holdsApi', () => {
  it('liste les gels et lit leur état réel', async () => {
    const { client, mock } = setup();
    mock.onGet('/holds').reply(200, holds);

    const parsed = await fetchHolds(client);

    expect(parsed).toHaveLength(holds.data.length);
    expect(parsed[0]?.status).toBe('held');
    expect(parsed[0]?.amount).toBe(holds.data[0]!.amount);
  });

  it('gèle un montant', async () => {
    const { client, mock } = setup();
    mock.onPost('/holds').reply(200, created);

    await placeHold(client, { amount: 15000, reason: 'Séquestre' });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      amount: 15000,
      reason: 'Séquestre',
    });
  });

  it('capture un gel au profit du technicien et rend le paiement émis', async () => {
    const { client, mock } = setup();
    mock.onPost(`/holds/${ID}/capture`).reply(200, captured);

    await expect(captureHold(client, ID, { payeeId: 't1', method: 'momo' })).resolves.toBe(
      captured.payment_id,
    );
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      payee_id: 't1',
      method: 'momo',
    });
  });

  it('libère un gel', async () => {
    const { client, mock } = setup();
    mock.onPost(`/holds/${ID}/release`).reply(200, released);

    const parsed = await releaseHold(client, ID);

    expect(mock.history.post[0]?.url).toBe(`/holds/${ID}/release`);
    expect(parsed?.status).toBe('released');
  });
});
