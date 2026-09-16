import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { matchingTranslations } from '../i18n';
import { TechnicianHomeScreen } from './TechnicianHomeScreen';

const NBSP = ' ';
const HOUR_MS = 60 * 60 * 1000;

function buildProposal(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    request_id: 'r1',
    technician_id: 't1',
    status: 'pending',
    expires_at: new Date(Date.now() + 2 * HOUR_MS).toISOString(),
    created_at: '2026-09-16T12:00:00.000000Z',
    updated_at: '2026-09-16T12:00:00.000000Z',
    price: '15000.00',
    message: 'Pouvez-vous passer cet après-midi ?',
    request: {
      id: 'r1',
      client_id: 'c1',
      title: 'Panne de courant',
      description: 'Plus de courant dans la cuisine.',
      status: 'quoted',
      photos: [],
      client: { id: 'c1', name: 'Client Démo' },
      address: { id: 'a1', label: 'Domicile', address: 'Rue de la démonstration', city: 'Yaoundé' },
      category: { id: 's1', slug: 'depannage-electrique', name: 'Dépannage électrique' },
    },
    ...overrides,
  };
}

const mission = {
  status: 'success',
  data: {
    proposal_id: 'p0',
    price: '12000.00',
    accepted_at: '2026-09-16T11:00:00.000000Z',
    job: null,
    request: {
      id: 'r0',
      title: 'Prise murale',
      description: 'La prise du salon ne fonctionne plus.',
      status: 'assigned',
      photos: [],
      category: 'Dépannage électrique',
    },
    client: { id: 'c1', name: 'Client Démo', phone: null, avatar: null },
    address: { label: 'Adresse de la demande', city: 'Yaoundé', address: null },
  },
};

const page = (proposals: unknown[]) => ({
  data: { current_page: 1, data: proposals, last_page: 1, total: proposals.length },
});

async function setup(
  proposals: unknown[],
  missionReply: unknown = { status: 'success', data: null },
) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/proposals/my').reply(200, page(proposals));
  mock.onGet('/proposals/active-mission').reply(200, missionReply);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { name: 'Paul Démo' }));
  await renderWithProviders(<TechnicianHomeScreen />, {
    api,
    sessionStore,
    translations: [matchingTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('TechnicianHomeScreen (E06)', () => {
  it('présente les propositions en attente en l’absence de mission', async () => {
    await setup([buildProposal()]);

    expect(await screen.findByText('Panne de courant')).toBeOnTheScreen();
    expect(screen.getByText('Bonjour, Paul Démo')).toBeOnTheScreen();
    expect(await screen.findByText('Aucune mission en cours.')).toBeOnTheScreen();
    expect(screen.getByText(`Prix proposé : 15${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('Lieu : Rue de la démonstration, Yaoundé')).toBeOnTheScreen();
    expect(
      screen.getByText('Message du client : Pouvez-vous passer cet après-midi ?'),
    ).toBeOnTheScreen();
    expect(screen.getByText(/^Expire dans \d+ h \d+ min$/)).toBeOnTheScreen();
  });

  it('accepte une proposition après confirmation', async () => {
    const { mock, user } = await setup([buildProposal()]);
    mock
      .onPost('/proposals/p1/accept')
      .reply(200, { status: 'success', message: 'Proposition acceptée' });

    await user.press(await screen.findByRole('button', { name: 'Accepter : Panne de courant' }));
    expect(
      screen.getByText('Vous vous engagez à réaliser « Panne de courant ».'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Accepter' }));

    expect(await screen.findByText('Proposition acceptée')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.get.length).toBeGreaterThanOrEqual(4));
  });

  it('refuse une proposition après confirmation', async () => {
    const { mock, user } = await setup([buildProposal()]);
    mock
      .onPost('/proposals/p1/refuse')
      .reply(200, { status: 'success', message: 'Proposition refusée' });

    await user.press(await screen.findByRole('button', { name: 'Refuser : Panne de courant' }));
    await user.press(screen.getByRole('button', { name: 'Refuser' }));

    expect(await screen.findByText('Proposition refusée')).toBeOnTheScreen();
  });

  it('affiche le message du serveur pour une proposition expirée', async () => {
    const { mock, user } = await setup([buildProposal()]);
    mock.onPost('/proposals/p1/accept').reply(410, { message: 'Cette proposition a expiré.' });

    await user.press(await screen.findByRole('button', { name: 'Accepter : Panne de courant' }));
    await user.press(screen.getByRole('button', { name: 'Accepter' }));

    expect(await screen.findByText('Cette proposition a expiré.')).toBeOnTheScreen();
  });

  it('présente la mission en cours et bloque toute nouvelle acceptation (RG-MIS-01)', async () => {
    await setup([buildProposal()], mission);

    expect(await screen.findByText('Prise murale')).toBeOnTheScreen();
    expect(screen.getByText('Client : Client Démo')).toBeOnTheScreen();
    expect(screen.getByText('Lieu : Yaoundé')).toBeOnTheScreen();
    expect(screen.getByText(`Montant : 12${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(
      await screen.findByRole('button', { name: 'Accepter : Panne de courant' }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        'Terminez votre mission en cours avant d’accepter une nouvelle proposition.',
      ),
    ).toBeOnTheScreen();
  });

  it('écarte les propositions expirées ou déjà décidées', async () => {
    await setup([
      buildProposal({ id: 'p1', expires_at: new Date(Date.now() - HOUR_MS).toISOString() }),
      buildProposal({ id: 'p2', status: 'accepted' }),
    ]);

    expect(await screen.findByText('Aucune proposition en attente.')).toBeOnTheScreen();
    expect(screen.queryByText('Panne de courant')).not.toBeOnTheScreen();
  });
});
