import { renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import technicians from '@/test/fixtures/directory/technicians.json';
import { createTestProviders } from '@/test/render';

import { directoryKeys } from './directoryKeys';
import { useTechnicianDirectory } from './useDirectory';

describe('hooks de l’annuaire', () => {
  it('construit une clé stable à partir des filtres', () => {
    expect(directoryKeys.search({})).toEqual([
      'directory',
      'search',
      { search: null, skill: null, latitude: null, longitude: null, radiusKm: null },
    ]);
    expect(
      directoryKeys.search({
        search: 'Awa',
        coordinates: { latitude: 1, longitude: 2 },
        radiusKm: 10,
      }),
    ).toEqual([
      'directory',
      'search',
      { search: 'Awa', skill: null, latitude: 1, longitude: 2, radiusKm: 10 },
    ]);
  });

  it('lit l’annuaire', async () => {
    const providers = createTestProviders();
    new MockAdapter(providers.api).onGet('/technicians').reply(200, technicians);

    const { result } = await renderHook(() => useTechnicianDirectory({}), {
      wrapper: providers.TestProviders,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.technicians).toHaveLength(technicians.data.length);
  });
});
