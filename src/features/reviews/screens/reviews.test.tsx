import { screen } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import myReviews from '@/test/fixtures/reviews/my-reviews.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import reviewCreated from '@/test/fixtures/reviews/review-created.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { reviewsTranslations } from '../i18n';
import { MyReviewsScreen } from './MyReviewsScreen';

const TECHNICIAN_ID = reviewCreated.data.target_id;
const FIRST = myReviews.data.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('MyReviewsScreen', () => {
  it('présente les avis reçus, la réputation et les badges', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/reviews/mine').reply(200, myReviews);
    mock.onGet(`/reputation/${TECHNICIAN_ID}`).reply(200, reputation);
    mock.onGet(`/badges/user/${TECHNICIAN_ID}`).reply(200, userBadges);
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { id: TECHNICIAN_ID }));
    await renderWithProviders(<MyReviewsScreen />, {
      api,
      sessionStore,
      translations: [reviewsTranslations],
    });

    expect(await screen.findByText(FIRST.comment)).toBeOnTheScreen();
    expect(screen.getByText('5,0 / 5', { exact: false })).toBeOnTheScreen();
    expect(
      screen.getByText(`Mission : ${FIRST.request.title}`, { exact: false }),
    ).toBeOnTheScreen();
    expect(await screen.findByText(`Réputation : ${reputation.total} points`)).toBeOnTheScreen();
    expect(await screen.findByText(userBadges.data[0]!.title)).toBeOnTheScreen();
  });

  it('annonce l’absence d’avis', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/reviews/mine').reply(200, { data: { data: [] } });
    mock.onGet(`/reputation/${TECHNICIAN_ID}`).reply(200, { data: { data: [] }, total: 0 });
    mock.onGet(`/badges/user/${TECHNICIAN_ID}`).reply(200, userBadges);
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { id: TECHNICIAN_ID }));
    await renderWithProviders(<MyReviewsScreen />, {
      api,
      sessionStore,
      translations: [reviewsTranslations],
    });

    expect(await screen.findByText('Aucun avis reçu pour le moment.')).toBeOnTheScreen();
  });
});
