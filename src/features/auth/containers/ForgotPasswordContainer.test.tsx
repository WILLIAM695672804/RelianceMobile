import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createTestProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { ForgotPasswordContainer } from './ForgotPasswordContainer';

async function setup() {
  const providers = createTestProviders({ translations: [authTranslations] });
  const mock = new MockAdapter(providers.api);
  await render(<ForgotPasswordContainer onBack={jest.fn()} />, {
    wrapper: providers.TestProviders,
  });
  return { mock, user: userEvent.setup() };
}

const submit = () => screen.getByRole('button', { name: 'Envoyer le lien' });

describe('ForgotPasswordContainer', () => {
  it('confirme l’envoi du lien', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/forgot-password').reply(200, { message: 'ok' });

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'a@example.test');
    await user.press(submit());

    expect(await screen.findByText('Vérifiez votre boîte de réception')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ email: 'a@example.test' });
  });

  it('reporte l’erreur de champ du serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/forgot-password').reply(422, { errors: { email: ['Adresse refusée.'] } });

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'a@example.test');
    await user.press(submit());

    expect(await screen.findByText('Adresse refusée.')).toBeOnTheScreen();
  });

  it('affiche une erreur générale', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/forgot-password').networkError();

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'a@example.test');
    await user.press(submit());

    expect(await screen.findByRole('alert')).toBeOnTheScreen();
  });
});
