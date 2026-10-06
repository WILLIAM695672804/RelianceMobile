import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { matchingKeys } from '@/features/matching';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import clientMission from '@/test/fixtures/missions/client-mission.json';
import jobCreated from '@/test/fixtures/missions/job-created.json';
import jobPhases from '@/test/fixtures/missions/job-phases.json';
import job from '@/test/fixtures/missions/job.json';
import jobs from '@/test/fixtures/missions/jobs.json';
import positionUpdated from '@/test/fixtures/missions/position-updated.json';
import technicianPosition from '@/test/fixtures/missions/technician-position.json';
import tracking from '@/test/fixtures/missions/tracking.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { missionsKeys } from './missionsKeys';
import {
  useClientMission,
  useCreateJob,
  useJob,
  useJobs,
  useJobSync,
  useJobTracking,
  useShareMyPosition,
  useTechnicianPosition,
  useUpdateJobPhases,
  useUpdateJobStatus,
} from './useMissions';

const JOB_ID = jobCreated.data.id;

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

describe('hooks des missions', () => {
  it('hiérarchise les clés sous « missions »', () => {
    expect(missionsKeys.list()).toEqual(['missions', 'list', null]);
    expect(missionsKeys.list('completed')).toEqual(['missions', 'list', 'completed']);
    expect(missionsKeys.detail('j1')).toEqual(['missions', 'detail', 'j1']);
    expect(missionsKeys.tracking('j1')).toEqual(['missions', 'tracking', 'j1']);
    expect(missionsKeys.clientMission()).toEqual(['missions', 'client-mission']);
    expect(missionsKeys.technicianPosition()).toEqual(['missions', 'technician-position']);
  });

  it('lit les missions, le détail, le suivi, la mission du client et la position', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/jobs').reply(200, jobs);
    mock.onGet(`/jobs/${JOB_ID}`).reply(200, job);
    mock.onGet(`/jobs/${JOB_ID}/tracking`).reply(200, tracking);
    mock.onGet('/mission/active').reply(200, clientMission);
    mock.onGet('/position/technician').reply(200, technicianPosition);

    const hooks = [
      await renderHook(() => useJobs(), { wrapper }),
      await renderHook(() => useJob(JOB_ID), { wrapper }),
      await renderHook(() => useJobTracking(JOB_ID), { wrapper }),
      await renderHook(() => useClientMission(), { wrapper }),
      await renderHook(() => useTechnicianPosition(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent les missions et la mission acceptée', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/jobs').reply(201, jobCreated);
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, job);
    mock.onPut(`/jobs/${JOB_ID}/phases`).reply(200, jobPhases);
    mock.onPost('/position/update').reply(200, positionUpdated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const create = await renderHook(() => useCreateJob(), { wrapper });
    const status = await renderHook(() => useUpdateJobStatus(JOB_ID), { wrapper });
    const phases = await renderHook(() => useUpdateJobPhases(JOB_ID), { wrapper });
    const position = await renderHook(() => useShareMyPosition(), { wrapper });

    await act(async () => {
      await create.result.current.mutateAsync(jobCreated.data.request_id);
      await status.result.current.mutateAsync({ status: 'en_route' });
      await phases.result.current.mutateAsync([
        { title: 'Diagnostic', status: 'pending', notes: null },
      ]);
      await position.result.current.mutateAsync({ latitude: 3.85, longitude: 11.5 });
    });
    await waitFor(() => expect(position.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: missionsKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: matchingKeys.all });
  });

  it('useJobSync recharge le suivi aux événements des canaux', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useJobSync('j1'), { wrapper });

    await act(async () => {
      fake.channels.get('jobs.j1')?.emit('JobStatusChanged', { status: 'arrived' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: missionsKeys.all });

    invalidate.mockClear();
    await act(async () => {
      fake.channels.get('jobs.j1')?.emit('PhasesUpdated', { phases: [] });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: missionsKeys.all });

    invalidate.mockClear();
    await act(async () => {
      fake.channels.get('tracking.j1')?.emit('TechnicianPositionUpdated', { latitude: 1 });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: missionsKeys.technicianPosition() });
  });

  it('useJobSync ne s’abonne à rien sans mission', async () => {
    const { wrapper, fake } = setup();

    await renderHook(() => useJobSync(null), { wrapper });

    expect(fake.privateChannel).not.toHaveBeenCalled();
  });
});
