import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import login2faRequired from '@/test/fixtures/auth/login-2fa-required.json';
import loginSuccess from '@/test/fixtures/auth/login-success.json';
import { createTestProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { LoginScreen } from './LoginScreen';

async function setup(options: { expired?: boolean } = {}) {
  const sessionStore = createSessionStore();
  if (options.expired) sessionStore.getState().setUnauthenticated({ expired: true });
  const providers = createTestProviders({ sessionStore, translations: [authTranslations] });
  const mock = new MockAdapter(providers.api);
  const onRegister = jest.fn();
  const onForgotPassword = jest.fn();
  await render(<LoginScreen onRegister={onRegister} onForgotPassword={onForgotPassword} />, {
    wrapper: providers.TestProviders,
  });
  return { ...providers, mock, onRegister, onForgotPassword, user: userEvent.setup() };
}

async function fillCredentials(email = 'technicien@example.test', password = 'secret') {
  await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), email);
  await fireEvent.changeText(screen.getByLabelText('Mot de passe'), password);
}

const submitButton = () => screen.getByRole('button', { name: 'Se connecter' });

describe('LoginScreen (E02)', () => {
  it('désactive la connexion tant que les deux champs ne sont pas renseignés', async () => {
    await setup();
    expect(submitButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'a@example.test');
    expect(submitButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Mot de passe'), 'secret');
    expect(submitButton()).toBeEnabled();
  });

  it('ouvre la session avec des identifiants valides', async () => {
    const { mock, sessionActions, user } = await setup();
    mock.onPost('/auth/login').reply(200, loginSuccess);

    await fillCredentials();
    await user.press(submitButton());

    await waitFor(() =>
      expect(sessionActions.signIn).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'technicien' }),
      ),
    );
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      email: 'technicien@example.test',
      password: 'secret',
    });
  });

  it('signale une adresse invalide sans appeler le serveur', async () => {
    const { mock, user } = await setup();

    await fillCredentials('awa', 'secret');
    await user.press(submitButton());

    expect(await screen.findByText('Adresse électronique invalide.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('signale des identifiants invalides', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/login').reply(401, { message: 'Identifiants invalides' });

    await fillCredentials();
    await user.press(submitButton());

    expect(
      await screen.findByText('Adresse électronique ou mot de passe incorrect.'),
    ).toBeOnTheScreen();
  });

  it('signale un compte désactivé', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/login').reply(403, { message: 'Compte désactivé' });

    await fillCredentials();
    await user.press(submitButton());

    expect(
      await screen.findByText('Votre compte est désactivé. Contactez le support.'),
    ).toBeOnTheScreen();
  });

  it('enchaîne l’étape 2FA et renvoie les identifiants avec le code', async () => {
    const { mock, sessionActions, user } = await setup();
    mock
      .onPost('/auth/login')
      .replyOnce(403, login2faRequired)
      .onPost('/auth/login')
      .replyOnce(200, loginSuccess);

    await fillCredentials();
    await user.press(submitButton());
    await fireEvent.changeText(await screen.findByLabelText('Code de vérification'), '123456');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));

    await waitFor(() => expect(sessionActions.signIn).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.post[1]?.data as string)).toEqual({
      email: 'technicien@example.test',
      password: 'secret',
      code: '123456',
    });
  });

  it('signale un code 2FA invalide', async () => {
    const { mock, user } = await setup();
    mock
      .onPost('/auth/login')
      .replyOnce(403, login2faRequired)
      .onPost('/auth/login')
      .replyOnce(401, { message: 'Code 2FA invalide' });

    await fillCredentials();
    await user.press(submitButton());
    await fireEvent.changeText(await screen.findByLabelText('Code de vérification'), '654321');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));

    expect(await screen.findByText('Code de vérification invalide.')).toBeOnTheScreen();
  });

  it('annonce l’expiration de session', async () => {
    await setup({ expired: true });
    expect(
      screen.getByText('Votre session a expiré. Veuillez vous reconnecter.'),
    ).toBeOnTheScreen();
  });

  it('mène à l’inscription et au mot de passe oublié', async () => {
    const { onRegister, onForgotPassword, user } = await setup();

    await user.press(screen.getByRole('button', { name: 'Créer un compte' }));
    await user.press(screen.getByRole('button', { name: 'Mot de passe oublié ?' }));

    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
