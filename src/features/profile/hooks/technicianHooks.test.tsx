import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import identity from '@/test/fixtures/technician/identity.json';
import locationUpdated from '@/test/fixtures/technician/location-updated.json';
import skillAdded from '@/test/fixtures/technician/skill-added.json';
import skillRemoved from '@/test/fixtures/technician/skill-removed.json';
import skills from '@/test/fixtures/technician/skills.json';
import stats from '@/test/fixtures/technician/stats.json';
import { createTestProviders } from '@/test/render';

import { profileKeys } from './profileKeys';
import {
  useAddTechnicianSkill,
  useMyTechnicianSkills,
  useRemoveTechnicianSkill,
  useTechnicianIdentity,
  useTechnicianStats,
  useUpdateServiceArea,
  useUpdateTechnicianProfile,
} from './useTechnician';

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks du volet technicien', () => {
  it('hiérarchise les clés sous « profile / technician »', () => {
    expect(profileKeys.technician()).toEqual(['profile', 'technician']);
    expect(profileKeys.technicianIdentity()).toEqual(['profile', 'technician', 'identity']);
    expect(profileKeys.technicianSkills()).toEqual(['profile', 'technician', 'skills']);
    expect(profileKeys.technicianStats()).toEqual(['profile', 'technician', 'stats']);
  });

  it('lit le profil, les compétences et les statistiques', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/technician/profile').reply(200, identity);
    mock.onGet('/technician/skills').reply(200, skills);
    mock.onGet('/technician/stats').reply(200, stats);

    const hooks = [
      await renderHook(() => useTechnicianIdentity(), { wrapper }),
      await renderHook(() => useMyTechnicianSkills(), { wrapper }),
      await renderHook(() => useTechnicianStats(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent le volet technicien', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPut('/technician/profile').reply(200, identity);
    mock.onPut('/technician/location').reply(200, locationUpdated);
    mock.onPost('/technician/skills').reply(200, skillAdded);
    mock.onDelete('/technician/skills/s1').reply(200, skillRemoved);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const profile = await renderHook(() => useUpdateTechnicianProfile(), { wrapper });
    const area = await renderHook(() => useUpdateServiceArea(), { wrapper });
    const addSkill = await renderHook(() => useAddTechnicianSkill(), { wrapper });
    const removeSkill = await renderHook(() => useRemoveTechnicianSkill(), { wrapper });

    await act(async () => {
      await profile.result.current.mutateAsync({ bio: 'Électricien.', competences: [] });
      await area.result.current.mutateAsync({
        latitude: 3.848,
        longitude: 11.5021,
        address: null,
        city: null,
        radius: 25,
        zones: [],
      });
      await addSkill.result.current.mutateAsync({
        skillId: 's1',
        proficiency: 4,
        experienceYears: 8,
        hourlyRate: 7500,
        travelFee: 0,
      });
      await removeSkill.result.current.mutateAsync('s1');
    });
    await waitFor(() => expect(removeSkill.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledTimes(4);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.technician() });
  });
});
