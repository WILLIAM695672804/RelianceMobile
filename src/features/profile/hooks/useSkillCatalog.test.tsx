import { renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import skills from '@/test/fixtures/profile/skills.json';
import { createTestProviders } from '@/test/render';

import { profileKeys } from './profileKeys';
import { useSkillCatalog } from './useSkillCatalog';

describe('useSkillCatalog', () => {
  it('met le catalogue en cache sous la clé du profil', async () => {
    const { api, queryClient, TestProviders } = createTestProviders();
    new MockAdapter(api).onGet('/skills').reply(200, skills);

    const { result } = await renderHook(() => useSkillCatalog(), { wrapper: TestProviders });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileKeys.skills()).toEqual(['profile', 'skills']);
    expect(queryClient.getQueryData(profileKeys.skills())).toHaveLength(skills.data.length);
  });
});
