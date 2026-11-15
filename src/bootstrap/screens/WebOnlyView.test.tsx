import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { WebOnlyView } from './WebOnlyView';

describe('WebOnlyView', () => {
  it('oriente l’administrateur vers le web et permet de se déconnecter', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();
    const onOpenWeb = jest.fn();
    await renderWithProviders(
      <WebOnlyView reason="admin" onLogout={onLogout} onOpenWeb={onOpenWeb} />,
    );
    expect(screen.getByText('Cet espace est réservé à la plateforme web.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Ouvrir la plateforme web' }));
    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));
    expect(onOpenWeb).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('signale un rôle inconnu', async () => {
    await renderWithProviders(<WebOnlyView reason="unknown" onLogout={jest.fn()} />);
    expect(
      screen.getByText('Votre rôle n’est pas reconnu par l’application mobile.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ouvrir la plateforme web' })).toBeNull();
  });
});
