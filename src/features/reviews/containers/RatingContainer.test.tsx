import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import requestDetail from '@/test/fixtures/requests/request-detail.json';
import reviewCreated from '@/test/fixtures/reviews/review-created.json';
import { renderWithProviders } from '@/test/render';

import { reviewsTranslations } from '../i18n';
import { RatingContainer, toRatingPayload } from './RatingContainer';

const REQUEST_ID = reviewCreated.data.request_id;

describe('toRatingPayload', () => {
  it('place les étiquettes en tête du commentaire', () => {
    expect(
      toRatingPayload('r1', { rating: 5, tags: ['Ponctuel', 'Courtois'], comment: ' Merci ' }),
    ).toEqual({ requestId: 'r1', rating: 5, comment: 'Ponctuel · Courtois\nMerci' });
  });

  it('n’envoie aucun commentaire vide', () => {
    expect(toRatingPayload('r1', { rating: 3, tags: [], comment: '  ' }).comment).toBeNull();
  });
});

describe('RatingContainer', () => {
  it('envoie la note, les étiquettes et le commentaire', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet(`/requests/${REQUEST_ID}`).reply(200, requestDetail);
    mock.onPost('/reviews').reply(201, reviewCreated);
    const onDone = jest.fn();
    await renderWithProviders(<RatingContainer requestId={REQUEST_ID} onDone={onDone} />, {
      api,
      translations: [reviewsTranslations],
    });
    const user = userEvent.setup();

    await user.press(await screen.findByRole('radio', { name: '5 étoiles' }));
    await user.press(await screen.findByText('Ponctuel'));
    await fireEvent.changeText(screen.getByLabelText('Commentaire (facultatif)'), 'Très bien');
    await user.press(screen.getByRole('button', { name: 'Envoyer la note' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(JSON.parse(mock.history.post[0]!.data as string)).toMatchObject({
      request_id: REQUEST_ID,
      rating: 5,
      comment: 'Ponctuel\nTrès bien',
    });
  });
});
