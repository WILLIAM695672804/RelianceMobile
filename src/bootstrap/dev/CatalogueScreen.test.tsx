import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { CatalogueScreen } from './CatalogueScreen';

describe('CatalogueScreen', () => {
  it('présente les primitives et bascule de thème', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<CatalogueScreen />);
    expect(screen.getByRole('header', { name: 'Catalogue' })).toBeOnTheScreen();
    expect(screen.getByTestId('catalogue')).toHaveStyle({ backgroundColor: '#ffffff' });

    await user.press(screen.getByRole('button', { name: 'Passer en thème sombre' }));

    expect(screen.getByTestId('catalogue')).toHaveStyle({ backgroundColor: '#0e0e12' });
    expect(screen.getByRole('button', { name: 'Passer en thème clair' })).toBeOnTheScreen();
  });

  it('fait vivre la barre d’onglets', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<CatalogueScreen />);
    await user.press(screen.getByRole('tab', { name: 'Carte' }));
    expect(screen.getByRole('tab', { name: 'Carte' })).toBeSelected();
  });
});
