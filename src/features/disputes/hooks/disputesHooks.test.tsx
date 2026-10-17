import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import created from '@/test/fixtures/disputes/dispute-created.json';
import messageAdded from '@/test/fixtures/disputes/dispute-message.json';
import dispute from '@/test/fixtures/disputes/dispute.json';
import disputes from '@/test/fixtures/disputes/disputes.json';
import { createTestProviders } from '@/test/render';

import { disputesKeys } from './disputesKeys';
import { useDispute, useDisputes, useOpenDispute, usePostDisputeMessage } from './useDisputes';

const ID = dispute.data.id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks des litiges', () => {
  it('hiérarchise les clés sous « disputes »', () => {
    expect(disputesKeys.list()).toEqual(['disputes', 'list']);
    expect(disputesKeys.detail('d1')).toEqual(['disputes', 'detail', 'd1']);
  });

  it('lit la liste et le détail', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/disputes').reply(200, disputes);
    mock.onGet(`/disputes/${ID}`).reply(200, dispute);

    const list = await renderHook(() => useDisputes(), { wrapper });
    const detail = await renderHook(() => useDispute(ID), { wrapper });

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
  });

  it('l’ouverture recharge les litiges', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/disputes').reply(201, created);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useOpenDispute(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        requestId: created.data.request_id,
        against: created.data.against,
        reason: 'quality',
        description: 'La prise ne tient pas.',
      });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: disputesKeys.all });
  });

  it('un message recharge le seul fil concerné', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost(`/disputes/${ID}/message`).reply(200, messageAdded);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => usePostDisputeMessage(ID), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('Voici une photo.');
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: disputesKeys.detail(ID) });
  });
});
