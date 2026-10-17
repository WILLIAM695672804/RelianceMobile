import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
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
import { ReviewFormScreen } from './ReviewFormScreen';

const REQUEST_ID = reviewCreated.data.request_id;
const TECHNICIAN_ID = reviewCreated.data.target_id;
const FIRST = myReviews.data.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('ReviewFormScreen', () => {
  it('exige une note avant l’envoi', async () => {
    const { api, mock } = setupApi();
    await renderWithProviders(<ReviewFormScreen requestId={REQUEST_ID} onDone={jest.fn()} />, {
      api,
      translations: [reviewsTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Envoyer mon avis' }));

    expect(await screen.findByText('Choisissez une note de 1 à 5.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('envoie la note et le commentaire', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/reviews').reply(201, reviewCreated);
    const onDone = jest.fn();
    await renderWithProviders(<ReviewFormScreen requestId={REQUEST_ID} onDone={onDone} />, {
      api,
      translations: [reviewsTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Noter 5 sur 5' }));
    expect(screen.getByText('Note retenue : 5 / 5')).toBeOnTheScreen();
    await fireEvent.changeText(
      screen.getByLabelText('Commentaire (facultatif)'),
      'Intervention rapide.',
    );
    await user.press(screen.getByRole('button', { name: 'Envoyer mon avis' }));

    expect(await screen.findByText('Merci, votre avis est enregistré.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: REQUEST_ID,
      rating: 5,
      comment: 'Intervention rapide.',
    });
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it('signale un avis déjà déposé', async () => {
    const { api, mock } = setupApi();
    mock
      .onPost('/reviews')
      .reply(409, { message: 'Vous avez deja laisse un avis pour cette mission.' });
    await renderWithProviders(<ReviewFormScreen requestId={REQUEST_ID} onDone={jest.fn()} />, {
      api,
      translations: [reviewsTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Noter 4 sur 5' }));
    await user.press(screen.getByRole('button', { name: 'Envoyer mon avis' }));

    expect(
      await screen.findByText('Vous avez deja laisse un avis pour cette mission.'),
    ).toBeOnTheScreen();
  });
});

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
    expect(screen.getByText('5,0 / 5')).toBeOnTheScreen();
    expect(screen.getByText(`Mission : ${FIRST.request.title}`)).toBeOnTheScreen();
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
