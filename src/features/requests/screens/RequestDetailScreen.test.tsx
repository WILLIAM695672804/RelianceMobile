import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { buildServiceRequest } from '@/test/fixtures/serviceRequests';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { RequestDetailScreen } from './RequestDetailScreen';

const NBSP = ' ';

async function setup(reply: [number, unknown]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/requests/r1').reply(...reply);
  const onFindTechnicians = jest.fn();
  await renderWithProviders(
    <RequestDetailScreen requestId="r1" onFindTechnicians={onFindTechnicians} />,
    { api, translations: [requestsTranslations] },
  );
  return { mock, onFindTechnicians, user: userEvent.setup() };
}

describe('RequestDetailScreen', () => {
  it('présente la demande et propose de trouver un technicien', async () => {
    const { onFindTechnicians, user } = await setup([200, { data: buildServiceRequest() }]);

    expect(await screen.findByText('Fuite sous l’évier')).toBeOnTheScreen();
    expect(screen.getByText('À attribuer')).toBeOnTheScreen();
    expect(screen.getByText('Catégorie : Réparation de fuite')).toBeOnTheScreen();
    expect(screen.getByText('Adresse : Rue de la démonstration, Douala')).toBeOnTheScreen();
    expect(screen.getByText(`Prix indicatif : 15${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Photo 1')).toHaveProp('source', {
      uri: 'http://api.test/storage/requests/photos/a.png',
    });

    await user.press(screen.getByRole('button', { name: 'Trouver un technicien' }));
    expect(onFindTechnicians).toHaveBeenCalledTimes(1);
  });

  it('indique l’attente de la réponse du technicien', async () => {
    await setup([200, { data: buildServiceRequest({ status: 'quoted' }) }]);

    expect(
      await screen.findByText(
        'Une proposition a été envoyée : en attente de la réponse du technicien.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Choisir un autre technicien' })).toBeOnTheScreen();
  });

  it('nomme le technicien assigné', async () => {
    await setup([
      200,
      {
        data: buildServiceRequest({
          status: 'assigned',
          counterpart: { id: 't1', name: 'Technicien Démo', role: 'technician' },
        }),
      },
    ]);

    expect(await screen.findByText('Technicien assigné : Technicien Démo')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Trouver un technicien' })).not.toBeOnTheScreen();
  });

  it('propose de réessayer si la demande est introuvable', async () => {
    await setup([404, { message: 'Not found' }]);

    expect(await screen.findByText('Élément introuvable.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeOnTheScreen();
  });

  it('propose de noter une intervention clôturée', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock
      .onGet('/requests/r1')
      .reply(200, { status: 'success', data: buildServiceRequest({ status: 'completed' }) });
    const onReview = jest.fn();
    await renderWithProviders(
      <RequestDetailScreen requestId="r1" onFindTechnicians={jest.fn()} onReview={onReview} />,
      { api, translations: [requestsTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Noter l’intervention' }));

    expect(onReview).toHaveBeenCalledWith('r1');
  });
});
