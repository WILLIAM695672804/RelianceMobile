import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import myReviews from '@/test/fixtures/reviews/my-reviews.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import reviewCreated from '@/test/fixtures/reviews/review-created.json';
import technicianReviews from '@/test/fixtures/reviews/technician-reviews.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';

import {
  fetchMyReviews,
  fetchReputation,
  fetchTechnicianReviews,
  fetchUserBadges,
  submitReview,
} from './reviewsApi';

const TECHNICIAN_ID = reviewCreated.data.target_id;
const REQUEST_ID = reviewCreated.data.request_id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('reviewsApi', () => {
  it('dépose un avis au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/reviews').reply(201, reviewCreated);

    await expect(
      submitReview(client, { requestId: REQUEST_ID, rating: 5, comment: 'Parfait' }),
    ).resolves.toMatchObject({ rating: 5 });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: REQUEST_ID,
      rating: 5,
      comment: 'Parfait',
    });
  });

  it('omet un commentaire absent', async () => {
    const { client, mock } = setup();
    mock.onPost('/reviews').reply(201, reviewCreated);

    await submitReview(client, { requestId: REQUEST_ID, rating: 4, comment: null });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: REQUEST_ID,
      rating: 4,
    });
  });

  it('lit les avis, les badges et la réputation', async () => {
    const { client, mock } = setup();
    mock.onGet(`/reviews/technician/${TECHNICIAN_ID}`).reply(200, technicianReviews);
    mock.onGet('/reviews/mine').reply(200, myReviews);
    mock.onGet(`/badges/user/${TECHNICIAN_ID}`).reply(200, userBadges);
    mock.onGet(`/reputation/${TECHNICIAN_ID}`).reply(200, reputation);

    await expect(fetchTechnicianReviews(client, TECHNICIAN_ID)).resolves.toHaveLength(
      technicianReviews.data.data.length,
    );
    await expect(fetchMyReviews(client)).resolves.toHaveLength(myReviews.data.data.length);
    await expect(fetchUserBadges(client, TECHNICIAN_ID)).resolves.toEqual([]);
    await expect(fetchReputation(client, TECHNICIAN_ID)).resolves.toMatchObject({
      total: reputation.total,
    });
  });
});
