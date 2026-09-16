import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import passwordInvalid from '@/test/fixtures/profile/password-invalid.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { ChangePasswordScreen } from './ChangePasswordScreen';

async function setup() {
  const onDone = jest.fn();
  const rendered = await renderWithProviders(<ChangePasswordScreen onDone={onDone} />, {
    translations: [profileTranslations],
  });
  return { ...rendered, mock: new MockAdapter(rendered.api), onDone, user: userEvent.setup() };
}

async function fill(current: string, next: string, confirmation = next) {
  await fireEvent.changeText(screen.getByLabelText('Mot de passe actuel'), current);
  await fireEvent.changeText(screen.getByLabelText('Nouveau mot de passe'), next);
  await fireEvent.changeText(
    screen.getByLabelText('Confirmation du nouveau mot de passe'),
    confirmation,
  );
}

const submit = () => screen.getByRole('button', { name: 'Modifier le mot de passe' });

describe('ChangePasswordScreen', () => {
  it('modifie le mot de passe puis revient au profil', async () => {
    const { mock, onDone, user } = await setup();
    mock
      .onPut('/auth/profile/password')
      .reply(200, { message: 'Mot de passe modifié avec succès.' });

    await fill('ancien-mdp', 'nouveau-mdp');
    await user.press(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      current_password: 'ancien-mdp',
      new_password: 'nouveau-mdp',
      new_password_confirmation: 'nouveau-mdp',
    });
  });

  it('contrôle la confirmation localement', async () => {
    const { mock, user } = await setup();

    await fill('ancien-mdp', 'nouveau-mdp', 'autre-mdp');
    await user.press(submit());

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeOnTheScreen();
    expect(mock.history.put).toHaveLength(0);
  });

  it('affiche le refus du mot de passe actuel', async () => {
    const { mock, onDone, user } = await setup();
    mock.onPut('/auth/profile/password').reply(400, passwordInvalid);

    await fill('errone-mdp', 'nouveau-mdp');
    await user.press(submit());

    expect(await screen.findByText("L'ancien mot de passe est incorrect.")).toBeOnTheScreen();
    expect(onDone).not.toHaveBeenCalled();
  });
});
