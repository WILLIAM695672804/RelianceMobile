import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import skills from '@/test/fixtures/profile/skills.json';

import { fetchSkillCatalog } from './skillsApi';

describe('skillsApi', () => {
  it('fetchSkillCatalog lit le catalogue public', async () => {
    const client = axios.create({ baseURL: 'http://api.test/api/v1' });
    new MockAdapter(client).onGet('/skills').reply(200, skills);

    const catalog = await fetchSkillCatalog(client);

    expect(catalog).toHaveLength(skills.data.length);
    expect(catalog.map((skill) => skill.slug)).toContain('depannage-electrique');
  });
});
