import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import completed from '@/test/fixtures/interventions/intervention-completed.json';
import created from '@/test/fixtures/interventions/intervention-created.json';
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';

import {
  completeIntervention,
  createIntervention,
  fetchIntervention,
  fetchInterventions,
  startIntervention,
} from './interventionsApi';

const ID = intervention.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('interventionsApi', () => {
  it('liste les interventions', async () => {
    const { client, mock } = setup();
    mock.onGet('/interventions').reply(200, interventions);

    await expect(fetchInterventions(client)).resolves.toHaveLength(interventions.data.data.length);
  });

  it('lit une intervention', async () => {
    const { client, mock } = setup();
    mock.onGet(`/interventions/${ID}`).reply(200, intervention);

    await expect(fetchIntervention(client, ID)).resolves.toMatchObject({ id: ID });
  });

  it('ouvre une intervention sur une mission', async () => {
    const { client, mock } = setup();
    mock.onPost('/interventions').reply(201, created);

    await createIntervention(client, {
      jobId: created.data.job_id,
      requestId: created.data.request_id,
      description: 'Remise en état du tableau électrique.',
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      job_id: created.data.job_id,
      request_id: created.data.request_id,
      description: 'Remise en état du tableau électrique.',
    });
  });

  it('démarre une intervention', async () => {
    const { client, mock } = setup();
    mock.onPost(`/interventions/${ID}/start`).reply(200, created);

    await startIntervention(client, ID);

    expect(mock.history.post[0]?.url).toBe(`/interventions/${ID}/start`);
  });

  it('envoie le rapport sous la forme attendue par le serveur', async () => {
    const { client, mock } = setup();
    mock.onPost(`/interventions/${ID}/complete`).reply(200, completed);

    await completeIntervention(client, ID, {
      workPerformed: 'Remplacement du disjoncteur',
      materials: ['Disjoncteur 16 A'],
      hours: 1.5,
      notes: null,
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      work_performed: 'Remplacement du disjoncteur',
      materials_used: ['Disjoncteur 16 A'],
      duration_hours: 1.5,
    });
  });

  it('omet les champs facultatifs vides', async () => {
    const { client, mock } = setup();
    mock.onPost(`/interventions/${ID}/complete`).reply(200, completed);

    await completeIntervention(client, ID, {
      workPerformed: 'Contrôle',
      materials: [],
      hours: null,
      notes: null,
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      work_performed: 'Contrôle',
    });
  });
});
