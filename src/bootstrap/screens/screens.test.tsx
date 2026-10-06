import { screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { createSessionStore } from '@/core/session';
import { profileTranslations } from '@/features/profile';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { LaunchScreen } from './LaunchScreen';
import { ProfileRoute } from './ProfileRoute';
import { WebOnlyScreen } from './WebOnlyScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

function storeWith(role: Parameters<typeof buildSessionUser>[0]) {
  const store = createSessionStore();
  store.getState().setAuthenticated(buildSessionUser(role, { name: 'Awa Diallo' }));
  return store;
}

describe('LaunchScreen (E01)', () => {
  it('restaure la session au montage en affichant le chargement', async () => {
    const restore = jest.fn(async () => 'authenticated' as const);
    await renderWithProviders(<LaunchScreen />, { sessionActions: { restore } });

    expect(screen.getByLabelText('Chargement…')).toBeOnTheScreen();
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('propose de réessayer sans réseau ni profil en cache', async () => {
    const user = userEvent.setup();
    const restore = jest.fn(async () => 'offline' as const);
    await renderWithProviders(<LaunchScreen />, { sessionActions: { restore } });

    await user.press(await screen.findByRole('button', { name: 'Réessayer' }));

    expect(restore).toHaveBeenCalledTimes(2);
  });
});

describe('ProfileRoute', () => {
  it('ouvre l’écran du profil choisi', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfileRoute />, {
      sessionStore: storeWith('client'),
      translations: [profileTranslations],
    });

    await user.press(screen.getByRole('button', { name: 'Mes adresses' }));
    await user.press(screen.getByRole('button', { name: 'Devenir technicien' }));

    expect(router.push).toHaveBeenNthCalledWith(1, '/locations');
    expect(router.push).toHaveBeenNthCalledWith(2, '/upgrade');
  });
});

describe('WebOnlyScreen', () => {
  it('oriente l’administrateur vers le web', async () => {
    await renderWithProviders(<WebOnlyScreen />, { sessionStore: storeWith('admin') });
    expect(screen.getByText('Cet espace est réservé à la plateforme web.')).toBeOnTheScreen();
  });

  it('signale un rôle inconnu et permet la déconnexion', async () => {
    const user = userEvent.setup();
    const logout = jest.fn(async () => undefined);
    await renderWithProviders(<WebOnlyScreen />, {
      sessionStore: storeWith('unknown'),
      sessionActions: { logout },
    });

    expect(
      screen.getByText('Votre rôle n’est pas reconnu par l’application mobile.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
