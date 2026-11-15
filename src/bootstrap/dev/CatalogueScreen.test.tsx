import { screen, userEvent } from '@testing-library/react-native';

import { notificationsTranslations } from '@/features/notifications';
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

  it('ouvre un écran du lot puis revient au catalogue', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<CatalogueScreen />, { translations: [notificationsTranslations] });
    await user.press(screen.getByRole('button', { name: 'Ouvrir Centre de notifications' }));
    expect(screen.getByRole('header', { name: 'Notifications' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Retour' }));
    expect(screen.getByRole('header', { name: 'Catalogue' })).toBeOnTheScreen();
  });

  it('ouvre d’emblée l’écran et le thème demandés', async () => {
    await renderWithProviders(
      <CatalogueScreen initialScreen="notifications" initialScheme="dark" />,
      {
        translations: [notificationsTranslations],
      },
    );
    expect(screen.getByTestId('notifications')).toHaveStyle({ backgroundColor: '#0e0e12' });
  });
});
