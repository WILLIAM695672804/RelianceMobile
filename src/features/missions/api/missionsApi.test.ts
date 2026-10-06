import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import clientMission from '@/test/fixtures/missions/client-mission.json';
import jobCompleted from '@/test/fixtures/missions/job-completed.json';
import jobCreated from '@/test/fixtures/missions/job-created.json';
import jobPhases from '@/test/fixtures/missions/job-phases.json';
import job from '@/test/fixtures/missions/job.json';
import jobs from '@/test/fixtures/missions/jobs.json';
import positionUpdated from '@/test/fixtures/missions/position-updated.json';
import technicianPosition from '@/test/fixtures/missions/technician-position.json';
import tracking from '@/test/fixtures/missions/tracking.json';

import {
  createJob,
  fetchClientMission,
  fetchJob,
  fetchJobs,
  fetchJobTracking,
  fetchTechnicianPosition,
  shareMyPosition,
  updateJobPhases,
  updateJobStatus,
} from './missionsApi';

const JOB_ID = jobCreated.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('missionsApi', () => {
  it('crée une mission à partir d’une demande', async () => {
    const { client, mock } = setup();
    mock.onPost('/jobs').reply(201, jobCreated);

    await expect(createJob(client, jobCreated.data.request_id)).resolves.toMatchObject({
      id: JOB_ID,
      status: 'pending',
    });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: jobCreated.data.request_id,
    });
  });

  it('lit la liste, le détail et le suivi d’une mission', async () => {
    const { client, mock } = setup();
    mock.onGet('/jobs').reply(200, jobs);
    mock.onGet(`/jobs/${JOB_ID}`).reply(200, job);
    mock.onGet(`/jobs/${JOB_ID}/tracking`).reply(200, tracking);

    await expect(fetchJobs(client)).resolves.toMatchObject({ total: jobs.meta.total });
    await expect(fetchJob(client, JOB_ID)).resolves.toMatchObject({ id: JOB_ID });
    await expect(fetchJobTracking(client, JOB_ID)).resolves.toMatchObject({ job_id: JOB_ID });
    expect(mock.history.get[0]?.params).toEqual({});
  });

  it('filtre la liste par statut', async () => {
    const { client, mock } = setup();
    mock.onGet('/jobs').reply(200, jobs);

    await fetchJobs(client, 'completed');

    expect(mock.history.get[0]?.params).toEqual({ status: 'completed' });
  });

  it('fait avancer le statut et transmet le compte rendu', async () => {
    const { client, mock } = setup();
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, jobCompleted);

    await updateJobStatus(client, JOB_ID, { status: 'completed', completionNotes: 'Terminé.' });

    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({
      status: 'completed',
      completion_notes: 'Terminé.',
    });
  });

  it('omet le compte rendu quand il est absent', async () => {
    const { client, mock } = setup();
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, jobCreated);

    await updateJobStatus(client, JOB_ID, { status: 'en_route' });

    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({ status: 'en_route' });
  });

  it('enregistre les phases de travail', async () => {
    const { client, mock } = setup();
    mock.onPut(`/jobs/${JOB_ID}/phases`).reply(200, jobPhases);

    const phases = [{ title: 'Diagnostic', status: 'completed', notes: null }];
    await expect(updateJobPhases(client, JOB_ID, phases)).resolves.toMatchObject({ id: JOB_ID });
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({ phases });
  });

  it('lit la mission du client, la position du technicien et partage la sienne', async () => {
    const { client, mock } = setup();
    mock.onGet('/mission/active').reply(200, clientMission);
    mock.onGet('/position/technician').reply(200, technicianPosition);
    mock.onPost('/position/update').reply(200, positionUpdated);

    await expect(fetchClientMission(client)).resolves.toMatchObject({
      job_id: clientMission.data.job_id,
    });
    await expect(fetchTechnicianPosition(client)).resolves.toMatchObject({
      latitude: technicianPosition.data.latitude,
    });
    await shareMyPosition(client, { latitude: 3.852, longitude: 11.503 });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      latitude: 3.852,
      longitude: 11.503,
    });
  });
});
