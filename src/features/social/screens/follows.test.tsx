import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import checkAfter from '@/test/fixtures/follows/check-after.json';
import counts from '@/test/fixtures/follows/counts.json';
import suggestions from '@/test/fixtures/follows/suggestions.json';
import unfollowed from '@/test/fixtures/follows/unfollowed.json';
import { renderWithProviders } from '@/test/render';

import { socialTranslations } from '../i18n';
import { FollowButton } from './FollowButton';
import { SuggestionsCard } from './SuggestionsCard';

const CANDIDATE = suggestions.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('FollowButton', () => {
  it('présente l’état suivi et permet de cesser de suivre', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/follows/u2/check').reply(200, checkAfter);
    mock.onGet('/users/u2/follow-counts').reply(200, counts);
    mock.onDelete('/follows/u2').reply(200, unfollowed);
    await renderWithProviders(<FollowButton userId="u2" name="Technicien Démo" />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByRole('button', { name: 'Ne plus suivre Technicien Démo' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(`${counts.followers_count} abonné(s)`)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Ne plus suivre Technicien Démo' }));

    expect(await screen.findByText('Vous ne suivez plus ce compte.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });

  it('suit un compte non suivi', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/follows/u2/check').reply(200, { following: false });
    mock.onGet('/users/u2/follow-counts').reply(200, counts);
    mock
      .onPost('/follows/u2')
      .reply(201, { status: 'success', message: 'Suivi', following: true, followers_count: 2 });
    await renderWithProviders(<FollowButton userId="u2" name="Technicien Démo" />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    // Le bouton reste désactivé tant que l'état de suivi n'est pas lu.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Suivre Technicien Démo' })).toBeEnabled(),
    );
    await user.press(screen.getByRole('button', { name: 'Suivre Technicien Démo' }));

    expect(await screen.findByText('Vous suivez ce compte.')).toBeOnTheScreen();
  });
});

describe('SuggestionsCard', () => {
  it('liste les suggestions et en suit une', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/follows/suggestions').reply(200, suggestions);
    mock
      .onPost(`/follows/${CANDIDATE.id}`)
      .reply(201, { status: 'success', message: 'Suivi', following: true, followers_count: 1 });
    await renderWithProviders(<SuggestionsCard />, { api, translations: [socialTranslations] });
    const user = userEvent.setup();

    expect(await screen.findByText('Comptes à suivre')).toBeOnTheScreen();
    const [followButton] = await screen.findAllByRole('button', {
      name: `Suivre ${CANDIDATE.name}`,
    });
    await user.press(followButton!);

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });

  it('annonce l’absence de suggestion', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/follows/suggestions').reply(200, { data: [] });
    await renderWithProviders(<SuggestionsCard />, { api, translations: [socialTranslations] });

    expect(await screen.findByText('Aucune suggestion pour le moment.')).toBeOnTheScreen();
  });
});
