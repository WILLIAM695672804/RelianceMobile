import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import completed from '@/test/fixtures/interventions/intervention-completed.json';
import created from '@/test/fixtures/interventions/intervention-created.json';
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';
import { createTestProviders } from '@/test/render';

import { interventionsKeys } from './interventionsKeys';
import {
  useCompleteIntervention,
  useCreateIntervention,
  useIntervention,
  useInterventions,
  useStartIntervention,
} from './useInterventions';

const ID = intervention.data.id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks des interventions', () => {
  it('hiérarchise les clés sous « interventions »', () => {
    expect(interventionsKeys.list()).toEqual(['interventions', 'list']);
    expect(interventionsKeys.detail('i1')).toEqual(['interventions', 'detail', 'i1']);
  });

  it('lit la liste et le détail', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/interventions').reply(200, interventions);
    mock.onGet(`/interventions/${ID}`).reply(200, intervention);

    const list = await renderHook(() => useInterventions(), { wrapper });
    const detail = await renderHook(() => useIntervention(ID), { wrapper });

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
    expect(detail.result.current.data?.duration_hours).toBe(1.5);
  });

  it('la clôture recharge les interventions', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost(`/interventions/${ID}/complete`).reply(200, completed);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useCompleteIntervention(ID), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        workPerformed: 'Remplacement',
        materials: [],
        hours: null,
        notes: null,
      });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: interventionsKeys.all });
  });

  it('l’ouverture et le démarrage rechargent les interventions', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/interventions').reply(201, created);
    mock.onPost(`/interventions/${ID}/start`).reply(200, created);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const open = await renderHook(() => useCreateIntervention(), { wrapper });
    await act(async () => {
      await open.result.current.mutateAsync({
        jobId: created.data.job_id,
        requestId: created.data.request_id,
      });
    });
    const start = await renderHook(() => useStartIntervention(ID), { wrapper });
    await act(async () => {
      await start.result.current.mutateAsync();
    });

    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
