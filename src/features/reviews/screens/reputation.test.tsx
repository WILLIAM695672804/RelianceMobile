import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import badges from '@/test/fixtures/reviews/badges.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';
import { renderWithProviders } from '@/test/render';

import { reviewsTranslations } from '../i18n';
import { BadgeDetailScreen } from './BadgeDetailScreen';
import { ReputationScreen } from './ReputationScreen';

const USER_ID = 'c2976e8d-b624-46dd-81a4-a7eb1f359636';
const EARNED = userBadges.data[0]!;
const CATALOG = badges.data.data;
const LOCKED = CATALOG.find(
  (badge) => !userBadges.data.some((earned) => earned.code === badge.code),
)!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/reputation/${USER_ID}`).reply(200, reputation);
  mock.onGet(`/badges/user/${USER_ID}`).reply(200, userBadges);
  mock.onGet('/badges').reply(200, badges);
  return { api, mock };
}

describe('ReputationScreen', () => {
  it('présente le total, le palier et la progression', async () => {
    const { api } = setupApi();
    await renderWithProviders(
      <ReputationScreen userId={USER_ID} onOpenBadge={jest.fn()} onOpenLeaderboard={jest.fn()} />,
      { api, translations: [reviewsTranslations] },
    );

    expect(await screen.findByText(`${reputation.total} points de réputation`)).toBeOnTheScreen();
    expect(screen.getByText('Niveau Bronze')).toBeOnTheScreen();
    expect(screen.getByText('Encore 40 points avant le niveau suivant.')).toBeOnTheScreen();
  });

  it('présente les badges obtenus et ceux qui restent à conquérir', async () => {
    const { api } = setupApi();
    await renderWithProviders(
      <ReputationScreen userId={USER_ID} onOpenBadge={jest.fn()} onOpenLeaderboard={jest.fn()} />,
      { api, translations: [reviewsTranslations] },
    );

    expect(await screen.findByTestId(`badge-${EARNED.code}`)).toBeOnTheScreen();
    expect(screen.getByTestId(`badge-${LOCKED.code}`)).toBeOnTheScreen();
    expect(screen.getByTestId(`badge-${EARNED.code}`).props.accessibilityState?.selected).toBe(
      true,
    );
    expect(screen.getByTestId(`badge-${LOCKED.code}`).props.accessibilityState?.selected).toBe(
      false,
    );
  });

  it('mène au classement et au détail d’un badge', async () => {
    const { api } = setupApi();
    const onOpenBadge = jest.fn();
    const onOpenLeaderboard = jest.fn();
    await renderWithProviders(
      <ReputationScreen
        userId={USER_ID}
        onOpenBadge={onOpenBadge}
        onOpenLeaderboard={onOpenLeaderboard}
      />,
      { api, translations: [reviewsTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Classement' }));
    await user.press(screen.getByTestId(`badge-${EARNED.code}`));

    expect(onOpenLeaderboard).toHaveBeenCalledTimes(1);
    expect(onOpenBadge).toHaveBeenCalledWith(EARNED.code);
  });

  it('présente l’historique des variations', async () => {
    const { api } = setupApi();
    await renderWithProviders(
      <ReputationScreen userId={USER_ID} onOpenBadge={jest.fn()} onOpenLeaderboard={jest.fn()} />,
      { api, translations: [reviewsTranslations] },
    );

    const change = reputation.data.data[0]!;
    expect(
      await screen.findByText(`+${change.change} points — ${change.reason}`),
    ).toBeOnTheScreen();
  });
});

describe('BadgeDetailScreen', () => {
  it('présente un badge obtenu et sa date', async () => {
    const { api } = setupApi();
    await renderWithProviders(<BadgeDetailScreen code={EARNED.code} userId={USER_ID} />, {
      api,
      translations: [reviewsTranslations],
    });

    expect(await screen.findByText(EARNED.title)).toBeOnTheScreen();
    expect(screen.getByText('Obtenu')).toBeOnTheScreen();
    expect(screen.getByText('Obtenu le 17/10/2026')).toBeOnTheScreen();
  });

  it('annonce un badge non obtenu et sa condition', async () => {
    const { api } = setupApi();
    await renderWithProviders(<BadgeDetailScreen code={LOCKED.code} userId={USER_ID} />, {
      api,
      translations: [reviewsTranslations],
    });

    expect(await screen.findByText(LOCKED.title)).toBeOnTheScreen();
    expect(screen.getByText('Non obtenu')).toBeOnTheScreen();
    expect(screen.getByText(LOCKED.description!)).toBeOnTheScreen();
  });

  it('annonce un badge disparu du catalogue', async () => {
    const { api } = setupApi();
    await renderWithProviders(<BadgeDetailScreen code="inconnu" userId={USER_ID} />, {
      api,
      translations: [reviewsTranslations],
    });

    expect(await screen.findByText('Ce badge n’existe plus au catalogue.')).toBeOnTheScreen();
  });
});
