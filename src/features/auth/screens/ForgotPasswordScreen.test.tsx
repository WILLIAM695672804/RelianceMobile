import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createTestProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

async function setup() {
  const providers = createTestProviders({ translations: [authTranslations] });
  const mock = new MockAdapter(providers.api);
  const onBack = jest.fn();
  await render(<ForgotPasswordScreen onBack={onBack} />, { wrapper: providers.TestProviders });
  return { mock, onBack, user: userEvent.setup() };
}

describe('ForgotPasswordScreen (E04)', () => {
  it('envoie le lien et confirme l’envoi', async () => {
    const { mock, user } = await setup();
    mock
      .onPost('/auth/forgot-password')
      .reply(200, { message: 'Lien de réinitialisation envoyé par email.' });

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'awa@example.test');
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));

    expect(
      await screen.findByText(
        'Un lien de réinitialisation vient d’être envoyé à votre adresse électronique.',
      ),
    ).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ email: 'awa@example.test' });
  });

  it('reporte l’erreur de validation du serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/forgot-password').reply(422, {
      message: 'The selected email is invalid.',
      errors: { email: ['The selected email is invalid.'] },
    });

    await fireEvent.changeText(
      screen.getByLabelText('Adresse électronique'),
      'inconnu@example.test',
    );
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));

    expect(await screen.findByText('The selected email is invalid.')).toBeOnTheScreen();
  });

  it('affiche le message métier d’une erreur 400', async () => {
    const { mock, user } = await setup();
    mock
      .onPost('/auth/forgot-password')
      .reply(400, { message: "Impossible d'envoyer le lien de réinitialisation." });

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'awa@example.test');
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));

    expect(
      await screen.findByText("Impossible d'envoyer le lien de réinitialisation."),
    ).toBeOnTheScreen();
  });

  it('revient à la connexion', async () => {
    const { onBack, user } = await setup();
    await user.press(screen.getByRole('button', { name: 'Retour à la connexion' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
