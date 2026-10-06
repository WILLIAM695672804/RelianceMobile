import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { buildRequestPage, buildServiceRequest } from '@/test/fixtures/serviceRequests';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { RequestsListScreen } from './RequestsListScreen';

async function setup(reply: [number, unknown]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/requests').reply(...reply);
  const onOpenRequest = jest.fn();
  await renderWithProviders(<RequestsListScreen onOpenRequest={onOpenRequest} />, {
    api,
    translations: [requestsTranslations],
  });
  return { mock, onOpenRequest, user: userEvent.setup() };
}

describe('RequestsListScreen', () => {
  it('liste toutes les demandes et ouvre l’une d’elles', async () => {
    const page = buildRequestPage([
      buildServiceRequest({ id: 'r1', title: 'Fuite sous l’évier' }),
      buildServiceRequest({ id: 'r2', title: 'Panne de courant', status: 'completed' }),
    ]);
    const { onOpenRequest, user } = await setup([200, page]);

    expect(await screen.findByText('Fuite sous l’évier')).toBeOnTheScreen();
    expect(screen.getByText('Panne de courant')).toBeOnTheScreen();
    expect(screen.getByText('2 demande(s)')).toBeOnTheScreen();
    expect(screen.getByText('Clôturée')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Voir la demande : Fuite sous l’évier' }));
    expect(onOpenRequest).toHaveBeenCalledWith('r1');
  });

  it('annonce une liste vide', async () => {
    await setup([200, buildRequestPage([])]);

    expect(await screen.findByText('Aucune demande enregistrée.')).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec', async () => {
    const { mock, user } = await setup([500, {}]);

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onGet('/requests').reply(200, buildRequestPage([buildServiceRequest()]));
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Fuite sous l’évier')).toBeOnTheScreen();
  });
});
