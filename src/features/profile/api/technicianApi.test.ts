import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import identity from '@/test/fixtures/technician/identity.json';
import locationUpdated from '@/test/fixtures/technician/location-updated.json';
import skillAdded from '@/test/fixtures/technician/skill-added.json';
import skillRemoved from '@/test/fixtures/technician/skill-removed.json';
import skills from '@/test/fixtures/technician/skills.json';
import stats from '@/test/fixtures/technician/stats.json';

import {
  addTechnicianSkill,
  fetchMyTechnicianSkills,
  fetchTechnicianIdentity,
  fetchTechnicianStats,
  removeTechnicianSkill,
  updateServiceArea,
  updateTechnicianProfile,
} from './technicianApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('technicianApi', () => {
  it('lit le profil professionnel, les compétences et les statistiques', async () => {
    const { client, mock } = setup();
    mock.onGet('/technician/profile').reply(200, identity);
    mock.onGet('/technician/skills').reply(200, skills);
    mock.onGet('/technician/stats').reply(200, stats);

    await expect(fetchTechnicianIdentity(client)).resolves.toMatchObject({ id: identity.data.id });
    await expect(fetchMyTechnicianSkills(client)).resolves.toHaveLength(skills.data.length);
    await expect(fetchTechnicianStats(client)).resolves.toMatchObject({
      missions_total: stats.missions_total,
    });
  });

  it('enregistre la présentation professionnelle', async () => {
    const { client, mock } = setup();
    mock.onPut('/technician/profile').reply(200, identity);

    await updateTechnicianProfile(client, { bio: 'Électricien.', competences: ['Normes'] });

    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      bio: 'Électricien.',
      competences: ['Normes'],
    });
  });

  it('enregistre la zone d’intervention au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPut('/technician/location').reply(200, locationUpdated);

    await updateServiceArea(client, {
      latitude: 3.848,
      longitude: 11.5021,
      address: 'Bastos',
      city: 'Yaoundé',
      radius: 25,
      zones: ['Bastos'],
    });

    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      latitude: 3.848,
      longitude: 11.5021,
      address: 'Bastos',
      city: 'Yaoundé',
      radius: 25,
      zones: ['Bastos'],
    });
  });

  it('ajoute et retire une compétence tarifée', async () => {
    const { client, mock } = setup();
    mock.onPost('/technician/skills').reply(200, skillAdded);
    mock.onDelete('/technician/skills/s1').reply(200, skillRemoved);

    await expect(
      addTechnicianSkill(client, {
        skillId: 's1',
        proficiency: 4,
        experienceYears: 8,
        hourlyRate: 7500,
        travelFee: 1000,
      }),
    ).resolves.toBe(skillAdded.message);
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      skill_id: 's1',
      proficiency: 4,
      experience_years: 8,
      hourly_rate: 7500,
      travel_fee: 1000,
    });
    await expect(removeTechnicianSkill(client, 's1')).resolves.toBe(skillRemoved.message);
  });
});
