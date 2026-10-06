import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import { buildRequestPage, buildServiceRequest } from '@/test/fixtures/serviceRequests';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { ClientHomeScreen } from './ClientHomeScreen';

async function setup(reply: [number, unknown]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/requests').reply(...reply);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('client', { name: 'Awa Démo' }));
  const onNewRequest = jest.fn();
  const onOpenRequest = jest.fn();
  await renderWithProviders(
    <ClientHomeScreen onNewRequest={onNewRequest} onOpenRequest={onOpenRequest} />,
    { api, sessionStore, translations: [requestsTranslations] },
  );
  return { mock, onNewRequest, onOpenRequest, user: userEvent.setup() };
}

describe('ClientHomeScreen (E05)', () => {
  it('présente le client, le nombre de demandes en cours et les demandes récentes', async () => {
    const { onOpenRequest, user } = await setup([
      200,
      buildRequestPage([
        buildServiceRequest({ id: 'r1', title: 'Fuite sous l’évier', status: 'quoted' }),
        buildServiceRequest({ id: 'r2', title: 'Climatiseur bruyant', status: 'completed' }),
      ]),
    ]);

    expect(await screen.findByText('Demandes en cours : 1')).toBeOnTheScreen();
    expect(screen.getByText('Bonjour, Awa Démo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Awa Démo')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Climatiseur bruyant' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Fuite sous l’évier' }));
    expect(onOpenRequest).toHaveBeenCalledWith('r1');
  });

  it('ouvre la création d’une demande', async () => {
    const { onNewRequest, user } = await setup([200, buildRequestPage([])]);

    expect(await screen.findByText('Vous n’avez pas encore de demande en cours')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Nouvelle demande' }));

    expect(onNewRequest).toHaveBeenCalledTimes(1);
  });

  it('bloque la création au-delà de cinq demandes ouvertes', async () => {
    await setup([
      200,
      buildRequestPage(
        Array.from({ length: 5 }, (_, index) =>
          buildServiceRequest({ id: `r${index}`, title: `Demande ${index}`, status: 'new' }),
        ),
      ),
    ]);

    expect(await screen.findByText('Demandes en cours : 5')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nouvelle demande' })).toBeDisabled();
    expect(
      screen.getByText(
        'Vous avez atteint la limite de 5 demandes ouvertes : attendez la clôture de l’une d’elles.',
      ),
    ).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec de chargement', async () => {
    const { mock, user } = await setup([500, {}]);

    expect(
      await screen.findByText('Impossible de charger vos informations. Vérifiez votre connexion.'),
    ).toBeOnTheScreen();
    mock.onGet('/requests').reply(200, buildRequestPage([]));
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Vous n’avez pas encore de demande en cours')).toBeOnTheScreen();
  });

  it('recharge les demandes quand l’utilisateur tire l’écran', async () => {
    const { mock } = await setup([200, buildRequestPage([])]);
    await screen.findByText('Vous n’avez pas encore de demande en cours');

    await act(async () => {
      screen.getByTestId('screen-scroll').props.refreshControl.props.onRefresh();
    });

    await waitFor(() => expect(mock.history.get).toHaveLength(2));
  });

  it('ouvre la liste complète des demandes', async () => {
    const onOpenAll = jest.fn();
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet('/requests').reply(200, buildRequestPage([buildServiceRequest()]));
    await renderWithProviders(
      <ClientHomeScreen onNewRequest={jest.fn()} onOpenRequest={jest.fn()} onOpenAll={onOpenAll} />,
      { api, translations: [requestsTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Toutes mes demandes' }));

    expect(onOpenAll).toHaveBeenCalledTimes(1);
  });
});
