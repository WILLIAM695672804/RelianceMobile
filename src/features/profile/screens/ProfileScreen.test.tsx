import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { createSessionStore, type Role } from '@/core/session';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { destinationsFor, ProfileScreen } from './ProfileScreen';

async function setup(role: Role, overrides: Parameters<typeof buildSessionUser>[1] = {}) {
  const sessionStore = createSessionStore();
  sessionStore
    .getState()
    .setAuthenticated(buildSessionUser(role, { name: 'Awa Diallo', ...overrides }));
  const onOpen = jest.fn();
  const logout = jest.fn(async () => undefined);
  const rendered = await renderWithProviders(<ProfileScreen onOpen={onOpen} />, {
    sessionStore,
    sessionActions: { logout },
    translations: [profileTranslations],
  });
  return { ...rendered, onOpen, logout, user: userEvent.setup() };
}

const menu = () => screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);

describe('ProfileScreen (E08)', () => {
  it('présente l’identité, le rôle et la vérification de l’adresse', async () => {
    await setup('technicien');

    expect(screen.getByText('Awa Diallo')).toBeOnTheScreen();
    expect(screen.getByText('technicien@example.test')).toBeOnTheScreen();
    expect(screen.getByText('Technicien')).toBeOnTheScreen();
    expect(screen.getByText('Adresse vérifiée')).toBeOnTheScreen();
    expect(screen.getByText('AD')).toBeOnTheScreen();
  });

  it('signale une adresse non vérifiée', async () => {
    await setup('client', { emailVerified: false });
    expect(screen.getByText('Adresse non vérifiée')).toBeOnTheScreen();
  });

  it.each([
    [
      'technicien',
      [
        'Modifier le profil',
        'Mot de passe',
        'Mes adresses',
        'Profil professionnel',
        'Mes compétences',
        'Ma zone d’intervention',
        'Mon planning',
        'Justificatifs d’identité',
        'Mes factures',
        'Mes rendez-vous',
        'Mon portefeuille',
        'Mes avis',
        'Notifications',
        'Messagerie',
        'Paramètres',
      ],
    ],
    [
      'client',
      [
        'Modifier le profil',
        'Mot de passe',
        'Mes adresses',
        'Devenir technicien',
        'Mes factures',
        'Mes rendez-vous',
        'Mon portefeuille',
        'Notifications',
        'Messagerie',
        'Paramètres',
      ],
    ],
    [
      'agence',
      [
        'Modifier le profil',
        'Mot de passe',
        'Mes adresses',
        'Mon portefeuille',
        'Notifications',
        'Messagerie',
        'Paramètres',
      ],
    ],
  ] as const)('adapte le menu au rôle %s', async (role, entries) => {
    await setup(role);
    expect(menu()).toEqual([...entries, 'Se déconnecter']);
  });

  it('ouvre la destination choisie', async () => {
    const { onOpen, user } = await setup('client');

    await user.press(screen.getByRole('button', { name: 'Mes adresses' }));

    expect(onOpen).toHaveBeenCalledWith('locations');
  });

  it('déconnecte', async () => {
    const { logout, user } = await setup('agence');

    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('propose les écrans professionnels au technicien uniquement', () => {
    expect(destinationsFor('technicien')).toEqual([
      'edit',
      'password',
      'locations',
      'professional',
      'skills',
      'zone',
      'planning',
      'kyc',
      'invoices',
      'appointments',
      'wallet',
      'reviews',
      'notifications',
      'messages',
      'settings',
    ]);
    expect(destinationsFor('client')).toEqual([
      'edit',
      'password',
      'locations',
      'upgrade',
      'invoices',
      'appointments',
      'wallet',
      'notifications',
      'messages',
      'settings',
    ]);
  });
});
