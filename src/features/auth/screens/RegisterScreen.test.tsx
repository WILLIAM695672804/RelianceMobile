import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import loginSuccess from '@/test/fixtures/auth/login-success.json';
import { createTestProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { RegisterScreen } from './RegisterScreen';

async function setup() {
  const providers = createTestProviders({ translations: [authTranslations] });
  const mock = new MockAdapter(providers.api);
  const onLogin = jest.fn();
  await render(<RegisterScreen onLogin={onLogin} />, { wrapper: providers.TestProviders });
  return { ...providers, mock, onLogin, user: userEvent.setup() };
}

const fill = (label: string, value: string) =>
  fireEvent.changeText(screen.getByLabelText(label), value);

async function fillCommonFields(confirmation = 'motdepasse') {
  await fill('Nom complet', 'Awa Diallo');
  await fill('Adresse électronique', 'awa@example.test');
  await fill('Mot de passe', 'motdepasse');
  await fill('Confirmation du mot de passe', confirmation);
}

const submitButton = () => screen.getByRole('button', { name: 'Créer mon compte' });

describe('RegisterScreen (E03)', () => {
  it('affiche les champs propres au rôle choisi', async () => {
    const { user } = await setup();
    expect(screen.getByRole('radio', { name: 'Client' })).toBeChecked();
    expect(screen.queryByLabelText('Nom de l’agence')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Agence' }));
    expect(screen.getByLabelText('Nom de l’agence')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Présentation (facultative)')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Technicien' }));
    expect(screen.getByLabelText('Présentation (facultative)')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nom de l’agence')).not.toBeOnTheScreen();
  });

  it('inscrit une agence et ouvre la session', async () => {
    const { mock, sessionActions, user } = await setup();
    mock.onPost('/auth/register').reply(201, { ...loginSuccess, message: 'Inscription réussie' });

    await user.press(screen.getByRole('radio', { name: 'Agence' }));
    await fillCommonFields();
    await fill('Nom de l’agence', 'Batimat Services');
    await user.press(submitButton());

    await waitFor(() => expect(sessionActions.signIn).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      role: 'agence',
      name: 'Awa Diallo',
      email: 'awa@example.test',
      password: 'motdepasse',
      password_confirmation: 'motdepasse',
      agency_name: 'Batimat Services',
    });
  });

  it('refuse des mots de passe différents sans appeler le serveur', async () => {
    const { mock, user } = await setup();

    await fillCommonFields('different1');
    await user.press(submitButton());

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('reporte les erreurs 422 sous les champs', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/register').reply(422, {
      message: 'The email has already been taken.',
      errors: { email: ['The email has already been taken.'] },
    });

    await fillCommonFields();
    await user.press(submitButton());

    expect(await screen.findByText('The email has already been taken.')).toBeOnTheScreen();
  });

  it('ramène à la connexion', async () => {
    const { onLogin, user } = await setup();
    await user.press(screen.getByRole('button', { name: 'J’ai déjà un compte' }));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
