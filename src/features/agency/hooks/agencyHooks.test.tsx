import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import agency from '@/test/fixtures/agency/agency.json';
import agencyUpdated from '@/test/fixtures/agency/agency-updated.json';
import members from '@/test/fixtures/agency/members.json';
import myAgency from '@/test/fixtures/agency/my-agency.json';
import { createTestProviders } from '@/test/render';

import { agencyKeys } from './agencyKeys';
import {
  useAddAgencyMember,
  useAgency,
  useAgencyMembers,
  useCreateAgency,
  useMyAgency,
  useRemoveAgencyMember,
  useUpdateAgency,
} from './useAgency';

const AGENCY_ID = agency.data.id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks de l’agence', () => {
  it('hiérarchise les clés sous « agency »', () => {
    expect(agencyKeys.mine()).toEqual(['agency', 'mine']);
    expect(agencyKeys.detail('a1')).toEqual(['agency', 'detail', 'a1']);
    expect(agencyKeys.members('a1')).toEqual(['agency', 'members', 'a1']);
  });

  it('lit mon agence, son détail et son équipe', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/my-agency').reply(200, myAgency);
    mock.onGet(`/agencies/${AGENCY_ID}`).reply(200, agency);
    mock.onGet(`/agencies/${AGENCY_ID}/members`).reply(200, members);

    const hooks = [
      await renderHook(() => useMyAgency(), { wrapper }),
      await renderHook(() => useAgency(AGENCY_ID), { wrapper }),
      await renderHook(() => useAgencyMembers(AGENCY_ID), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent l’agence', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/agencies').reply(201, agencyUpdated);
    mock.onPut(`/agencies/${AGENCY_ID}`).reply(200, agencyUpdated);
    mock.onPost(`/agencies/${AGENCY_ID}/members`).reply(201, { message: 'Membre ajouté' });
    mock.onDelete(`/agencies/${AGENCY_ID}/members/u2`).reply(200, { message: 'Membre retiré' });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const create = await renderHook(() => useCreateAgency(), { wrapper });
    const update = await renderHook(() => useUpdateAgency(AGENCY_ID), { wrapper });
    const addMember = await renderHook(() => useAddAgencyMember(AGENCY_ID), { wrapper });
    const removeMember = await renderHook(() => useRemoveAgencyMember(AGENCY_ID), { wrapper });

    const payload = {
      name: 'Agence',
      description: null,
      address: null,
      phone: null,
      email: null,
    };
    await act(async () => {
      await create.result.current.mutateAsync(payload);
      await update.result.current.mutateAsync(payload);
      await addMember.result.current.mutateAsync({ userId: 'u2', role: 'member' });
      await removeMember.result.current.mutateAsync('u2');
    });
    await waitFor(() => expect(removeMember.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: agencyKeys.all });
    expect(invalidate).toHaveBeenCalledTimes(4);
  });
});
