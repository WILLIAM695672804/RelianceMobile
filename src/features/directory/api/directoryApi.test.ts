import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import nearby from '@/test/fixtures/directory/technicians-nearby.json';
import technicians from '@/test/fixtures/directory/technicians.json';

import { searchTechnicians } from './directoryApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('searchTechnicians', () => {
  it('lit l’annuaire sans filtre', async () => {
    const { client, mock } = setup();
    mock.onGet('/technicians').reply(200, technicians);

    const result = await searchTechnicians(client, {});

    expect(result.technicians).toHaveLength(technicians.data.length);
    expect(result.total).toBe(technicians.meta.total);
    expect(mock.history.get[0]?.params).toEqual({});
  });

  it('transmet la recherche, la compétence et la position', async () => {
    const { client, mock } = setup();
    mock.onGet('/technicians').reply(200, nearby);

    await searchTechnicians(client, {
      search: ' Awa ',
      skill: 'depannage-electrique',
      coordinates: { latitude: 3.848, longitude: 11.5021 },
      radiusKm: 25,
    });

    expect(mock.history.get[0]?.params).toEqual({
      search: 'Awa',
      skill: 'depannage-electrique',
      latitude: 3.848,
      longitude: 11.5021,
      radius_km: 25,
    });
  });
});
