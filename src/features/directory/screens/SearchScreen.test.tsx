import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createMemoryStore } from '@/core/storage';
import technicians from '@/test/fixtures/directory/technicians.json';
import noResult from '@/test/fixtures/directory/technicians-search.json';
import { renderWithProviders } from '@/test/render';

import { directoryTranslations } from '../i18n';
import { createSearchHistory } from '../model/searchHistory';
import { SearchScreen } from './SearchScreen';

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technicians').reply(200, technicians);
  return { api, mock };
}

async function mount(terms: string[] = []) {
  const store = createMemoryStore();
  const history = createSearchHistory(store);
  for (const term of terms) history.remember(term);
  const { api, mock } = setupApi();
  const onOpen = jest.fn();
  await renderWithProviders(<SearchScreen history={history} onOpen={onOpen} />, {
    api,
    translations: [directoryTranslations],
  });
  return { history, mock, onOpen, user: userEvent.setup() };
}

describe('SearchScreen', () => {
  it('annonce l’absence d’historique', async () => {
    await mount();

    expect(screen.getByText('Aucune recherche récente.')).toBeOnTheScreen();
  });

  it('présente les recherches récentes, la plus récente en tête', async () => {
    await mount(['plombier', 'électricien']);

    expect(screen.getByRole('button', { name: 'électricien' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'plombier' })).toBeOnTheScreen();
  });

  it('retient le terme soumis et présente les résultats', async () => {
    const { history, mock, user } = await mount();

    await user.type(screen.getByLabelText('Rechercher un technicien'), 'plombier');
    await user.press(screen.getByRole('button', { name: 'Rechercher' }));

    expect(await screen.findByText('Résultats')).toBeOnTheScreen();
    expect(history.read()).toEqual(['plombier']);
    expect(mock.history.get.some((call) => call.params?.search === 'plombier')).toBe(true);
  });

  it('relance une recherche récente', async () => {
    const { mock, user } = await mount(['plombier']);

    await user.press(screen.getByRole('button', { name: 'plombier' }));

    expect(await screen.findByText('Résultats')).toBeOnTheScreen();
    expect(mock.history.get.some((call) => call.params?.search === 'plombier')).toBe(true);
  });

  it('annonce une recherche sans résultat', async () => {
    const store = createMemoryStore();
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, noResult);
    await renderWithProviders(
      <SearchScreen history={createSearchHistory(store)} onOpen={jest.fn()} />,
      { api, translations: [directoryTranslations] },
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Rechercher un technicien'), 'soudeur');
    await user.press(screen.getByRole('button', { name: 'Rechercher' }));

    expect(
      await screen.findByText('Aucun technicien ne correspond à « soudeur ».'),
    ).toBeOnTheScreen();
  });

  it('efface l’historique', async () => {
    const { history, user } = await mount(['plombier', 'électricien']);

    await user.press(screen.getByRole('button', { name: 'Effacer' }));

    expect(screen.getByText('Aucune recherche récente.')).toBeOnTheScreen();
    expect(history.read()).toEqual([]);
  });

  it('ouvre le profil du technicien choisi', async () => {
    const { onOpen, user } = await mount(['plombier']);

    await user.press(screen.getByRole('button', { name: 'plombier' }));
    const first = technicians.data[0]!;
    const cards = await screen.findAllByRole('button', {
      name: `Ouvrir le profil de ${first.name}`,
    });
    await user.press(cards[0]!);

    expect(onOpen).toHaveBeenCalledWith(first.id);
  });
});
