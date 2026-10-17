import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import created from '@/test/fixtures/disputes/dispute-created.json';
import messageAdded from '@/test/fixtures/disputes/dispute-message.json';
import dispute from '@/test/fixtures/disputes/dispute.json';
import disputes from '@/test/fixtures/disputes/disputes.json';

import { fetchDispute, fetchDisputes, openDispute, postDisputeMessage } from './disputesApi';

const ID = dispute.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('disputesApi', () => {
  it('liste les litiges', async () => {
    const { client, mock } = setup();
    mock.onGet('/disputes').reply(200, disputes);

    await expect(fetchDisputes(client)).resolves.toHaveLength(disputes.data.length);
  });

  it('lit un litige et son fil', async () => {
    const { client, mock } = setup();
    mock.onGet(`/disputes/${ID}`).reply(200, dispute);

    const parsed = await fetchDispute(client, ID);

    expect(parsed.id).toBe(ID);
    expect(parsed.messages).toHaveLength(dispute.data.messages.length);
  });

  it('ouvre un litige avec le corps attendu', async () => {
    const { client, mock } = setup();
    mock.onPost('/disputes').reply(201, created);

    await openDispute(client, {
      requestId: created.data.request_id,
      against: created.data.against,
      reason: 'quality',
      description: 'La prise ne tient pas.',
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: created.data.request_id,
      against: created.data.against,
      reason: 'quality',
      description: 'La prise ne tient pas.',
    });
  });

  it('ajoute un message au fil', async () => {
    const { client, mock } = setup();
    mock.onPost(`/disputes/${ID}/message`).reply(200, messageAdded);

    await postDisputeMessage(client, ID, 'Voici une photo.');

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      message: 'Voici une photo.',
    });
  });
});
