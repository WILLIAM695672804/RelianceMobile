import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  createSearchHistory,
  directoryTranslations,
  filterByDomains,
  SearchContainer,
  type TechnicianCard,
} from '@/features/directory';
import { createMemoryStore } from '@/core/storage';
import { reviewsTranslations } from '@/features/reviews';
import technicianProfile from '@/test/fixtures/matching/technician-profile.json';
import technicians from '@/test/fixtures/directory/technicians.json';
import badges from '@/test/fixtures/reviews/badges.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';
import stats from '@/test/fixtures/technician/stats.json';
import { renderWithProviders } from '@/test/render';

import {
  BadgeContainer,
  LeaderboardContainer,
  ReputationContainer,
  toBadgeSummaries,
} from './ReputationContainers';
import { TechProfileContainer } from './TechProfileContainer';

const translations = [directoryTranslations, reviewsTranslations];
const USER_ID = 'u1';

function api() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('filterByDomains', () => {
  const cards = technicians.data as unknown as TechnicianCard[];
  it('ne garde que les techniciens d’un domaine retenu', () => {
    expect(filterByDomains(cards, new Set(['Plomberie']))).toHaveLength(2);
    expect(filterByDomains(cards, new Set())).toHaveLength(cards.length);
  });
});

describe('SearchContainer', () => {
  it('interroge l’annuaire après la saisie et ouvre un résultat', async () => {
    const { client, mock } = api();
    mock.onGet('/skills').reply(200, { data: [] });
    mock.onGet('/technicians').reply(200, technicians);
    const onOpen = jest.fn();
    await renderWithProviders(
      <SearchContainer
        history={createSearchHistory(createMemoryStore())}
        onBack={jest.fn()}
        onOpen={onOpen}
      />,
      { api: client, translations },
    );

    await fireEvent.changeText(screen.getByLabelText('Rechercher'), 'Démo');
    const results = await screen.findAllByRole(
      'button',
      { name: /Technicien Démo/ },
      { timeout: 2000 },
    );
    await userEvent.setup().press(results[0]!);

    expect(onOpen).toHaveBeenCalledWith(technicians.data[0]!.id);
    await waitFor(() =>
      expect(
        mock.history.get.some((r) => r.url === '/technicians' && r.params?.search === 'Démo'),
      ).toBe(true),
    );
  });
});

describe('TechProfileContainer', () => {
  it('présente le profil et suit le technicien', async () => {
    const { client, mock } = api();
    const id = technicianProfile.data.id;
    mock.onGet(`/technicians/${id}/profile`).reply(200, technicianProfile);
    mock.onGet(`/follows/${id}/check`).reply(200, { following: false });
    mock.onPost(`/follows/${id}`).reply(200, { message: 'ok' });
    const onMessage = jest.fn();
    await renderWithProviders(
      <TechProfileContainer
        technicianId={id}
        onBack={jest.fn()}
        onMessage={onMessage}
        onBook={jest.fn()}
      />,
      { api: client, translations },
    );
    const user = userEvent.setup();

    expect(await screen.findByText(technicianProfile.data.bio!)).toBeOnTheScreen();
    await user.press(await screen.findByRole('button', { name: 'Suivre ce technicien' }));
    await waitFor(() =>
      expect(mock.history.post.some((r) => r.url === `/follows/${id}`)).toBe(true),
    );
  });
});

describe('réputation', () => {
  it('toBadgeSummaries marque les badges obtenus', () => {
    const summaries = toBadgeSummaries(badges.data.data, userBadges.data);
    expect(summaries.find((badge) => badge.id === 'first-mission')).toMatchObject({
      earned: true,
      progress: 1,
    });
    expect(summaries.find((badge) => badge.id === 'punctual')?.earned).toBe(false);
  });

  it('présente le rang et ouvre un badge', async () => {
    const { client, mock } = api();
    mock.onGet(`/reputation/${USER_ID}`).reply(200, reputation);
    mock.onGet(`/badges/user/${USER_ID}`).reply(200, userBadges);
    mock.onGet('/badges').reply(200, badges);
    mock.onGet('/technician/stats').reply(200, stats);
    const onBadge = jest.fn();
    await renderWithProviders(
      <ReputationContainer
        userId={USER_ID}
        name="Paul"
        onBack={jest.fn()}
        onBadge={onBadge}
        onLeaderboard={jest.fn()}
      />,
      { api: client, translations },
    );

    await userEvent.setup().press(await screen.findByRole('button', { name: /Première mission/ }));
    expect(onBadge).toHaveBeenCalledWith('first-mission');
  });

  it('présente un badge obtenu', async () => {
    const { client, mock } = api();
    mock.onGet(`/badges/user/${USER_ID}`).reply(200, userBadges);
    mock.onGet('/badges').reply(200, badges);
    await renderWithProviders(
      <BadgeContainer code="first-mission" userId={USER_ID} onBack={jest.fn()} />,
      { api: client, translations },
    );
    expect(await screen.findByText('Première mission')).toBeOnTheScreen();
    expect(await screen.findByText('Obtenu')).toBeOnTheScreen();
  });

  it('classe les techniciens par note', async () => {
    const { client, mock } = api();
    mock.onGet('/technicians').reply(200, technicians);
    const onOpen = jest.fn();
    await renderWithProviders(
      <LeaderboardContainer selfId={null} onBack={jest.fn()} onOpen={onOpen} />,
      { api: client, translations },
    );
    const entries = await screen.findAllByRole('button', { name: /Technicien Démo/ });
    await userEvent.setup().press(entries[0]!);
    expect(onOpen).toHaveBeenCalledWith(technicians.data[0]!.id);
  });
});
