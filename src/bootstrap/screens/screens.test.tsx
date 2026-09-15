import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { createSessionStore } from '@/core/session';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { AccountScreen } from './AccountScreen';
import { LaunchScreen } from './LaunchScreen';
import { RoleHomeScreen } from './RoleHomeScreen';
import { WebOnlyScreen } from './WebOnlyScreen';

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

describe('RoleHomeScreen', () => {
  it('salue l’utilisateur et indique son rôle', async () => {
    await renderWithProviders(<RoleHomeScreen />, { sessionStore: storeWith('technicien') });
    expect(screen.getByRole('header')).toHaveTextContent('Bonjour, Awa Diallo');
    expect(screen.getByText('Technicien')).toBeOnTheScreen();
  });
});

describe('AccountScreen', () => {
  it('affiche le profil et déconnecte', async () => {
    const user = userEvent.setup();
    const logout = jest.fn(async () => undefined);
    await renderWithProviders(<AccountScreen />, {
      sessionStore: storeWith('client'),
      sessionActions: { logout },
    });

    expect(screen.getByText('client@example.test')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('signale la déconnexion en cours', async () => {
    const user = userEvent.setup();
    const logout = jest.fn(() => new Promise<void>(() => undefined));
    await renderWithProviders(<AccountScreen />, {
      sessionStore: storeWith('client'),
      sessionActions: { logout },
    });

    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));

    expect(await screen.findByRole('button', { name: 'Se déconnecter' })).toBeBusy();
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
