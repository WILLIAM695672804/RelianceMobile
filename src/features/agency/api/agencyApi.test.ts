import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import agency from '@/test/fixtures/agency/agency.json';
import agencyUpdated from '@/test/fixtures/agency/agency-updated.json';
import members from '@/test/fixtures/agency/members.json';
import myAgency from '@/test/fixtures/agency/my-agency.json';

import {
  addAgencyMember,
  createAgency,
  fetchAgency,
  fetchAgencyMembers,
  fetchMyAgency,
  removeAgencyMember,
  updateAgency,
} from './agencyApi';

const AGENCY_ID = agency.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('agencyApi', () => {
  it('lit mon agence, son détail et son équipe', async () => {
    const { client, mock } = setup();
    mock.onGet('/my-agency').reply(200, myAgency);
    mock.onGet(`/agencies/${AGENCY_ID}`).reply(200, agency);
    mock.onGet(`/agencies/${AGENCY_ID}/members`).reply(200, members);

    await expect(fetchMyAgency(client)).resolves.toMatchObject({ id: AGENCY_ID });
    await expect(fetchAgency(client, AGENCY_ID)).resolves.toMatchObject({ id: AGENCY_ID });
    await expect(fetchAgencyMembers(client, AGENCY_ID)).resolves.toHaveLength(members.data.length);
  });

  it('renvoie null quand aucune agence n’est rattachée', async () => {
    const { client, mock } = setup();
    mock.onGet('/my-agency').reply(200, { data: null, message: 'Aucune agence' });

    await expect(fetchMyAgency(client)).resolves.toBeNull();
  });

  it('crée et met à jour une agence au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/agencies').reply(201, agencyUpdated);
    mock.onPut(`/agencies/${AGENCY_ID}`).reply(200, agencyUpdated);

    const payload = {
      name: 'Agence',
      description: 'Description',
      address: 'Yaoundé',
      phone: '600000000',
      email: 'contact@example.test',
    };
    await expect(createAgency(client, payload)).resolves.toMatchObject({ id: AGENCY_ID });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      name: 'Agence',
      description: 'Description',
      address: 'Yaoundé',
      phone: '600000000',
      email: 'contact@example.test',
    });

    await updateAgency(client, AGENCY_ID, { ...payload, description: null, phone: null });
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      name: 'Agence',
      address: 'Yaoundé',
      email: 'contact@example.test',
    });
  });

  it('ajoute et retire un membre', async () => {
    const { client, mock } = setup();
    mock.onPost(`/agencies/${AGENCY_ID}/members`).reply(201, { message: 'Membre ajouté' });
    mock.onDelete(`/agencies/${AGENCY_ID}/members/u2`).reply(200, { message: 'Membre retiré' });

    await expect(
      addAgencyMember(client, AGENCY_ID, { userId: 'u2', role: 'member' }),
    ).resolves.toBe('Membre ajouté');
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      user_id: 'u2',
      role: 'member',
    });
    await expect(removeAgencyMember(client, AGENCY_ID, 'u2')).resolves.toBe('Membre retiré');
  });
});
