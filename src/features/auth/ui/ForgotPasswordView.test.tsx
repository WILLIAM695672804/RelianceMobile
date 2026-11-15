import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { authTranslations } from '../i18n';

import { ForgotPasswordView, type ForgotPasswordViewProps } from './ForgotPasswordView';

async function setup(overrides: Partial<ForgotPasswordViewProps> = {}) {
  const props: ForgotPasswordViewProps = {
    status: 'form',
    submitting: false,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  };
  const result = await renderWithProviders(<ForgotPasswordView {...props} />, {
    translations: [authTranslations],
  });
  return { props, ...result };
}

describe('ForgotPasswordView', () => {
  it('valide l’adresse puis la transmet', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));
    expect(await screen.findByText('Ce champ est obligatoire.')).toBeOnTheScreen();
    expect(props.onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Adresse électronique'), 'client.capture@example.test');
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));
    expect(props.onSubmit).toHaveBeenCalledWith('client.capture@example.test');
  });

  it('confirme l’envoi avec l’adresse saisie et ramène à la connexion', async () => {
    const user = userEvent.setup();
    const { props, rerender } = await setup();
    await user.type(screen.getByLabelText('Adresse électronique'), 'a@b.cm');
    await user.press(screen.getByRole('button', { name: 'Envoyer le lien' }));
    await rerender(<ForgotPasswordView {...props} status="sent" />);
    expect(
      screen.getByRole('header', { name: 'Vérifiez votre boîte de réception' }),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Retour à la connexion' }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it('affiche l’erreur générale et celle du serveur', async () => {
    await setup({ formError: 'Trop de tentatives.', emailError: 'Adresse inconnue.' });
    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(screen.getByText('Adresse inconnue.')).toBeOnTheScreen();
  });
});
