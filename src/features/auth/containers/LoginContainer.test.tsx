import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { Linking } from 'react-native';

import { createSessionStore } from '@/core/session';
import login2faRequired from '@/test/fixtures/auth/login-2fa-required.json';
import loginSuccess from '@/test/fixtures/auth/login-success.json';
import { createTestProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { useChosenRole } from '../model/chosenRole';
import { LoginContainer } from './LoginContainer';

async function setup(options: { expired?: boolean } = {}) {
  const sessionStore = createSessionStore();
  if (options.expired) sessionStore.getState().setUnauthenticated({ expired: true });
  const providers = createTestProviders({ sessionStore, translations: [authTranslations] });
  const mock = new MockAdapter(providers.api);
  const onForgotPassword = jest.fn();
  await render(
    <LoginContainer webUrl="https://reliance.example" onForgotPassword={onForgotPassword} />,
    {
      wrapper: providers.TestProviders,
    },
  );
  return { ...providers, mock, onForgotPassword, user: userEvent.setup() };
}

async function fillCredentials(email = 'technicien@example.test', password = 'secret') {
  await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), email);
  await fireEvent.changeText(screen.getByLabelText('Mot de passe'), password);
}

const submitButton = () => screen.getByRole('button', { name: 'Se connecter' });

describe('LoginContainer', () => {
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

  it('signale des identifiants invalides puis un compte désactivé', async () => {
    const { mock, user } = await setup();
    mock
      .onPost('/auth/login')
      .replyOnce(401, { message: 'x' })
      .onPost('/auth/login')
      .replyOnce(403, { message: 'x' });

    await fillCredentials();
    await user.press(submitButton());
    expect(
      await screen.findByText('Adresse électronique ou mot de passe incorrect.'),
    ).toBeOnTheScreen();

    await user.press(submitButton());
    expect(
      await screen.findByText('Votre compte est désactivé. Contactez le support.'),
    ).toBeOnTheScreen();
  });

  it('reporte les erreurs de champ du serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/login').reply(422, { errors: { email: ['Adresse inconnue du serveur.'] } });

    await fillCredentials();
    await user.press(submitButton());

    expect(await screen.findByText('Adresse inconnue du serveur.')).toBeOnTheScreen();
  });

  it('enchaîne l’étape 2FA et renvoie les identifiants avec le code', async () => {
    const { mock, sessionActions, user } = await setup();
    mock
      .onPost('/auth/login')
      .replyOnce(403, login2faRequired)
      .onPost('/auth/login')
      .replyOnce(401, { message: 'x' })
      .onPost('/auth/login')
      .replyOnce(200, loginSuccess);

    await fillCredentials();
    await user.press(submitButton());
    await fireEvent.changeText(await screen.findByLabelText('Code de vérification'), '654321');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Code de vérification invalide.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Code de vérification'), '123456');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));

    await waitFor(() => expect(sessionActions.signIn).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.post[2]?.data as string)).toEqual({
      email: 'technicien@example.test',
      password: 'secret',
      code: '123456',
    });
  });

  it('revient aux identifiants depuis l’étape 2FA', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/login').reply(403, login2faRequired);

    await fillCredentials();
    await user.press(submitButton());
    await user.press(await screen.findByRole('button', { name: 'Retour' }));

    expect(submitButton()).toBeOnTheScreen();
  });

  it('annonce l’expiration de session', async () => {
    await setup({ expired: true });
    expect(
      screen.getByText('Votre session a expiré. Veuillez vous reconnecter.'),
    ).toBeOnTheScreen();
  });

  it('ouvre l’inscription web du rôle choisi et le mot de passe oublié', async () => {
    useChosenRole.setState({ role: 'agence' });
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { onForgotPassword, user } = await setup();

    await user.press(screen.getByRole('link', { name: 'Créer un compte' }));
    await user.press(screen.getByRole('link', { name: 'Mot de passe oublié ?' }));

    expect(openURL).toHaveBeenCalledWith('https://reliance.example/inscription/agence');
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
