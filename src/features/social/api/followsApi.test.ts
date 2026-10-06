import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import checkAfter from '@/test/fixtures/follows/check-after.json';
import counts from '@/test/fixtures/follows/counts.json';
import followed from '@/test/fixtures/follows/followed.json';
import suggestions from '@/test/fixtures/follows/suggestions.json';
import unfollowed from '@/test/fixtures/follows/unfollowed.json';

import {
  checkFollow,
  fetchFollowCounts,
  fetchSuggestions,
  followUser,
  unfollowUser,
} from './followsApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('followsApi', () => {
  it('lit l’état de suivi, les compteurs et les suggestions', async () => {
    const { client, mock } = setup();
    mock.onGet('/follows/u2/check').reply(200, checkAfter);
    mock.onGet('/users/u2/follow-counts').reply(200, counts);
    mock.onGet('/follows/suggestions').reply(200, suggestions);

    await expect(checkFollow(client, 'u2')).resolves.toBe(true);
    await expect(fetchFollowCounts(client, 'u2')).resolves.toMatchObject({
      followers_count: counts.followers_count,
    });
    await expect(fetchSuggestions(client)).resolves.toHaveLength(suggestions.data.length);
  });

  it('suit un compte et considère un conflit comme un succès', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/follows/u2')
      .reply(201, { status: 'success', message: 'Suivi', following: true, followers_count: 1 });

    await expect(followUser(client, 'u2')).resolves.toBe(true);

    const conflict = setup();
    conflict.mock.onPost('/follows/u2').reply(409, followed);
    await expect(followUser(conflict.client, 'u2')).resolves.toBe(true);
  });

  it('cesse de suivre un compte', async () => {
    const { client, mock } = setup();
    mock.onDelete('/follows/u2').reply(200, unfollowed);

    await expect(unfollowUser(client, 'u2')).resolves.toBe(false);
  });
});
