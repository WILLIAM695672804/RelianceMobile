import { screen, userEvent } from '@testing-library/react-native';

import { authTranslations, LoginView } from '@/features/auth';
import { renderWithProviders } from '@/test/render';

import { legalTranslations } from '../i18n';
import { LegalView } from './LegalView';

describe('LegalView', () => {
  it('présente les cinq articles des conditions d’utilisation', async () => {
    const onBack = jest.fn();
    await renderWithProviders(<LegalView kind="terms" onBack={onBack} />, {
      translations: [legalTranslations],
    });

    expect(
      screen.getByRole('header', { name: 'Conditions générales d’utilisation' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('1. Objet')).toBeOnTheScreen();
    expect(screen.getByText('5. Résiliation')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Retour' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('présente la politique de confidentialité', async () => {
    await renderWithProviders(<LegalView kind="privacy" onBack={jest.fn()} />, {
      translations: [legalTranslations],
    });
    expect(screen.getByRole('header', { name: 'Politique de confidentialité' })).toBeOnTheScreen();
    expect(screen.getByText('1. Données collectées')).toBeOnTheScreen();
    expect(screen.getByText('Dernière mise à jour : mai 2026.')).toBeOnTheScreen();
  });
});

describe('liens légaux de la connexion', () => {
  it('ouvre les conditions puis la confidentialité', async () => {
    const onLegal = jest.fn();
    await renderWithProviders(
      <LoginView
        step="credentials"
        submitting={false}
        onSubmitCredentials={jest.fn()}
        onSubmitCode={jest.fn()}
        onBackToCredentials={jest.fn()}
        onForgotPassword={jest.fn()}
        onRegister={jest.fn()}
        onLegal={onLegal}
      />,
      { translations: [legalTranslations, authTranslations] },
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('link', { name: 'CGU' }));
    await user.press(screen.getByRole('link', { name: 'Confidentialité' }));
    expect(onLegal.mock.calls).toEqual([['terms'], ['privacy']]);
  });
});
