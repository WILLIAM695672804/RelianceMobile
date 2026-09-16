import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import { buildApiUser, buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { SettingsScreen } from './SettingsScreen';

async function setup(options: { twoFactor?: boolean; verified?: boolean } = {}) {
  const sessionStore = createSessionStore();
  sessionStore
    .getState()
    .setAuthenticated(buildSessionUser('client', { emailVerified: options.verified ?? true }));
  const onLanguageChange = jest.fn();
  const logout = jest.fn(async () => undefined);
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/auth/me').reply(200, {
    user: buildApiUser('client', { two_factor_enabled: options.twoFactor ?? false }),
  });
  const rendered = await renderWithProviders(
    <SettingsScreen onLanguageChange={onLanguageChange} />,
    { api, sessionStore, sessionActions: { logout }, translations: [profileTranslations] },
  );
  await screen.findByText(options.twoFactor ? 'Activée' : 'Désactivée');
  return { ...rendered, mock, onLanguageChange, logout, user: userEvent.setup() };
}

describe('SettingsScreen (E26)', () => {
  it('change la langue de l’interface et la mémorise', async () => {
    const { onLanguageChange, user } = await setup();

    await user.press(screen.getByRole('button', { name: 'English' }));

    expect(await screen.findByText('Settings')).toBeOnTheScreen();
    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });

  it('active la double authentification avec le secret et un code', async () => {
    const { mock, user } = await setup();
    mock
      .onPost('/auth/2fa/generate')
      .reply(200, { secret: 'JBSWY3DPEHPK3PXP', qr_code_svg: '<svg/>' });
    mock.onPost('/auth/2fa/enable').reply(200, { message: '2FA activée avec succès.' });

    await user.press(screen.getByRole('button', { name: 'Activer la double authentification' }));
    expect(await screen.findByText('JBSWY3DPEHPK3PXP')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Code de vérification'), '123456');
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));

    expect(await screen.findByText('Double authentification activée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[1]?.data as string)).toEqual({ code: '123456' });
  });

  it('affiche le refus d’un code invalide', async () => {
    const { mock, user } = await setup({ twoFactor: true });
    mock.onPost('/auth/2fa/disable').reply(400, { message: 'Code invalide.' });

    await user.press(screen.getByRole('button', { name: 'Désactiver la double authentification' }));
    await fireEvent.changeText(screen.getByLabelText('Code de vérification'), '000000');
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));

    expect(await screen.findByText('Code invalide.')).toBeOnTheScreen();
  });

  it('abandonne la procédure', async () => {
    const { user } = await setup({ twoFactor: true });

    await user.press(screen.getByRole('button', { name: 'Désactiver la double authentification' }));
    await user.press(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByLabelText('Code de vérification')).not.toBeOnTheScreen();
  });

  it('propose de renvoyer le courriel de vérification si nécessaire', async () => {
    const { mock, user } = await setup({ verified: false });
    mock
      .onPost('/auth/email/verification-notification')
      .reply(200, { message: 'Lien de vérification envoyé.' });

    await user.press(screen.getByRole('button', { name: 'Renvoyer le courriel de vérification' }));

    expect(await screen.findByText('Courriel de vérification envoyé.')).toBeOnTheScreen();
  });

  it('masque le renvoi pour une adresse vérifiée et déconnecte', async () => {
    const { logout, user } = await setup();

    expect(
      screen.queryByRole('button', { name: 'Renvoyer le courriel de vérification' }),
    ).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Se déconnecter' }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
