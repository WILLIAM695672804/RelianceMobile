import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import requestCreated from '@/test/fixtures/requests/request-created.json';
import requestDetail from '@/test/fixtures/requests/request-detail.json';
import requests from '@/test/fixtures/requests/requests.json';
import { createTestProviders } from '@/test/render';

import { requestsKeys } from './requestsKeys';
import { useCreateRequest, useRequest, useRequests } from './useRequests';

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks requests', () => {
  it('requestsKeys hiérarchise les clés sous « requests »', () => {
    expect(requestsKeys.list()).toEqual(['requests', 'list']);
    expect(requestsKeys.detail('r1')).toEqual(['requests', 'detail', 'r1']);
  });

  it('useRequests et useRequest lisent les demandes', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/requests').reply(200, requests);
    mock.onGet(`/requests/${requestDetail.data.id}`).reply(200, requestDetail);

    const list = await renderHook(() => useRequests(), { wrapper });
    const detail = await renderHook(() => useRequest(requestDetail.data.id), { wrapper });

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
  });

  it('useCreateRequest invalide les demandes', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/requests').reply(201, requestCreated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useCreateRequest(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        title: 'Panne de courant',
        description: 'Plus de courant dans la cuisine depuis ce matin.',
        categorySlug: 'depannage-electrique',
        latitude: 3.848,
        longitude: 11.5021,
        addressLabel: null,
        city: null,
        photos: [],
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestsKeys.all });
  });
});
