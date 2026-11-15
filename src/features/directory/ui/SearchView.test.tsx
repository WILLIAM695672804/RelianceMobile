import { screen, userEvent, within } from '@testing-library/react-native';

import searchFixture from '@/test/fixtures/directory/technicians.json';
import { renderWithProviders } from '@/test/render';

import { directoryTranslations } from '../i18n';
import { technicianResult } from '../model/searchResults';
import { technicianPageSchema } from '../schemas/directorySchemas';

import { SearchView, type SearchViewProps } from './SearchView';

const results = technicianPageSchema.parse(searchFixture).data.map(technicianResult);

async function setup(overrides: Partial<SearchViewProps> = {}) {
  const props: SearchViewProps = {
    query: '',
    onQueryChange: jest.fn(),
    onSubmit: jest.fn(),
    filters: [
      { key: 'pros', label: 'Pros', selected: false },
      { key: 'quartier', label: 'Quartier', selected: false },
    ],
    onToggleFilter: jest.fn(),
    onClearFilters: jest.fn(),
    recent: ['Plombier urgence', 'Climatisation'],
    onPickRecent: jest.fn(),
    onClearRecent: jest.fn(),
    status: 'idle',
    results: [],
    onRetry: jest.fn(),
    onOpenResult: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  };
  const result = await renderWithProviders(<SearchView {...props} />, {
    translations: [directoryTranslations],
  });
  return { props, ...result };
}

describe('SearchView', () => {
  it('propose les recherches récentes et les relance, sans tendances lorsqu’il n’y en a pas', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    expect(screen.getByText('Récent')).toBeOnTheScreen();
    expect(screen.queryByText('Tendances dans votre quartier')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Climatisation' }));
    expect(props.onPickRecent).toHaveBeenCalledWith('Climatisation');
    await user.press(screen.getByRole('button', { name: 'Effacer' }));
    expect(props.onClearRecent).toHaveBeenCalledTimes(1);
  });

  it('affiche les tendances fournies', async () => {
    const user = userEvent.setup();
    const onPickTrending = jest.fn();
    await setup({
      trending: [{ key: 'clim', label: 'Climatisation', detail: '8 pros' }],
      recent: [],
      onPickTrending,
    });
    expect(screen.getByText('Tendances dans votre quartier')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Climatisation' }));
    expect(onPickTrending).toHaveBeenCalledWith('clim');
  });

  it('relaie la saisie, la validation et l’effacement', async () => {
    const user = userEvent.setup();
    const { props } = await setup({ query: 'Pa' });
    await user.type(screen.getByLabelText('Rechercher'), 'u');
    expect(props.onQueryChange).toHaveBeenCalledWith('Pau');
    await user.press(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(props.onQueryChange).toHaveBeenLastCalledWith('');
  });

  it('présente les résultats capturés, compte et ouvre un résultat', async () => {
    const user = userEvent.setup();
    const first = results[0]!;
    const query = first.title.split(' ')[0]!;
    const { props } = await setup({ query, status: 'ready', results });
    expect(
      screen.getByText(
        `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »`,
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: first.title })[0]!);
    expect(props.onOpenResult).toHaveBeenCalledWith(first);
  });

  it('gère les filtres : sélection, « Tous » et retrait d’un filtre actif', async () => {
    const user = userEvent.setup();
    const { props } = await setup({
      query: 'Paul',
      status: 'ready',
      results,
      filters: [
        { key: 'pros', label: 'Pros', selected: true },
        { key: 'quartier', label: 'Quartier', selected: false },
      ],
    });
    expect(screen.getByRole('button', { name: 'Tous' })).not.toBeSelected();
    expect(screen.getAllByRole('button', { name: 'Pros' })[0]).toBeSelected();
    await user.press(screen.getByRole('button', { name: 'Quartier' }));
    expect(props.onToggleFilter).toHaveBeenCalledWith('quartier');
    await user.press(screen.getByRole('button', { name: 'Tous' }));
    expect(props.onClearFilters).toHaveBeenCalledTimes(1);
    const active = screen.getByText('Filtres ·').parent!;
    await user.press(within(active).getByRole('button', { name: 'Pros' }));
    expect(props.onToggleFilter).toHaveBeenLastCalledWith('pros');
  });

  it('présente l’absence de résultat et l’erreur', async () => {
    const user = userEvent.setup();
    const onBrowseCategories = jest.fn();
    const { rerender, props } = await setup({
      query: 'soudure tig',
      status: 'ready',
      results: [],
      onBrowseCategories,
    });
    expect(screen.getByText('Aucun résultat')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voir toutes les catégories' }));
    expect(onBrowseCategories).toHaveBeenCalledTimes(1);

    await rerender(<SearchView {...props} status="error" errorMessage="Serveur indisponible" />);
    expect(screen.getByText('Serveur indisponible')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
