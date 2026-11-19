import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import identity from '@/test/fixtures/technician/identity.json';
import { renderWithProviders } from '@/test/render';

import { matchingTranslations } from '../i18n';
import { receivedProposalSchema } from '../schemas/matchingSchemas';
import { RadarContainer, toRadarProposal } from './RadarContainer';

const NOW = Date.parse('2026-11-19T10:00:00Z');
const inMinutes = (minutes: number) => new Date(NOW + minutes * 60_000).toISOString();

function proposal(id: string, title: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    request_id: `r-${id}`,
    status: 'pending',
    price: '9000.00',
    expires_at: inMinutes(135),
    request: {
      id: `r-${id}`,
      title,
      description: null,
      category: { name: 'Électricité' },
      address: {
        address: 'Rue d’essai',
        city: 'Douala',
        meta: { latitude: '4.05', longitude: '9.74' },
      },
    },
    ...overrides,
  };
}

describe('toRadarProposal', () => {
  it('formule le délai et lit les coordonnées de l’adresse', () => {
    const parsed = receivedProposalSchema.parse(proposal('p1', 'Prise qui grille'));
    expect(toRadarProposal(parsed, NOW, { fallback: 'Intervention' })).toEqual({
      id: 'p1',
      title: 'Prise qui grille',
      category: 'Électricité',
      place: 'Douala',
      price: 9000,
      expiresIn: '2 h 15',
      coordinates: { latitude: 4.05, longitude: 9.74 },
    });
  });

  it('se replie sans demande ni coordonnées, et en minutes sous l’heure', () => {
    const parsed = receivedProposalSchema.parse(
      proposal('p2', 'x', { request: null, expires_at: inMinutes(9) }),
    );
    expect(toRadarProposal(parsed, NOW, { fallback: 'Intervention' })).toMatchObject({
      title: 'Intervention',
      place: '',
      expiresIn: '9 min',
      coordinates: null,
    });
  });
});

async function setup(items: unknown[]) {
  jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick', 'setImmediate'] });
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/proposals/my').reply(200, { data: { current_page: 1, data: items } });
  mock.onGet('/technician/profile').reply(200, identity);
  const props = { onBack: jest.fn(), onAccepted: jest.fn() };
  await renderWithProviders(<RadarContainer {...props} />, {
    api,
    translations: [matchingTranslations],
  });
  return { mock, props, user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }) };
}

afterEach(() => jest.useRealTimers());

describe('RadarContainer', () => {
  it('présente la plus récente des propositions actives et accepte la mission', async () => {
    const { mock, props, user } = await setup([
      proposal('p1', 'Prise qui grille'),
      proposal('p2', 'Disjoncteur'),
      proposal('p3', 'Expirée', { expires_at: inMinutes(-5) }),
      proposal('p4', 'Déjà acceptée', { status: 'accepted' }),
    ]);
    mock.onPost('/proposals/p1/accept').reply(200, { message: 'Proposition acceptée.' });

    expect(await screen.findByText('Prise qui grille')).toBeOnTheScreen();
    expect(screen.getByText('2 missions disponibles')).toBeOnTheScreen();
    expect(screen.getByText('1 autre demande en attente')).toBeOnTheScreen();
    expect(screen.getByText('Expire dans 2 h 15')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Accepter' }));
    await waitFor(() => expect(props.onAccepted).toHaveBeenCalled());
    expect(mock.history.post.map((request) => request.url)).toEqual(['/proposals/p1/accept']);
  });

  it('refuse sans quitter le radar', async () => {
    const { mock, props, user } = await setup([proposal('p1', 'Prise qui grille')]);
    mock.onPost('/proposals/p1/refuse').reply(200, { message: 'Proposition refusée.' });

    await user.press(await screen.findByRole('button', { name: 'Refuser' }));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(mock.history.post[0]!.url).toBe('/proposals/p1/refuse');
    expect(props.onAccepted).not.toHaveBeenCalled();
  });

  it('indique la veille lorsqu’aucune proposition n’attend', async () => {
    await setup([]);
    expect(await screen.findByText('En attente de nouvelles demandes…')).toBeOnTheScreen();
    expect(screen.getByText('0 mission disponible')).toBeOnTheScreen();
  });
});
