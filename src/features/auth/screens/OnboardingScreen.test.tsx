import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { OnboardingScreen } from './OnboardingScreen';

async function mount(onDone = jest.fn()) {
  await renderWithProviders(<OnboardingScreen onDone={onDone} />, {
    translations: [authTranslations],
  });
  return { onDone, user: userEvent.setup() };
}

describe('OnboardingScreen', () => {
  it('parcourt les trois diapositives puis termine', async () => {
    const { onDone, user } = await mount();

    expect(screen.getByText('Trouvez le bon technicien')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Suivant' }));

    expect(screen.getByText('Paiement sécurisé par séquestre')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Suivant' }));

    expect(screen.getByText('Suivez chaque intervention')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Commencer' }));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('permet de passer le fil dès la première diapositive', async () => {
    const { onDone, user } = await mount();

    await user.press(screen.getByRole('button', { name: 'Passer' }));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('annonce l’avancement aux lecteurs d’écran', async () => {
    const { user } = await mount();

    const gauge = screen.getByTestId('onboarding-steps');
    expect(gauge.props.accessibilityValue).toEqual({ min: 1, max: 3, now: 1 });

    await user.press(screen.getByRole('button', { name: 'Suivant' }));

    expect(screen.getByTestId('onboarding-steps').props.accessibilityValue).toEqual({
      min: 1,
      max: 3,
      now: 2,
    });
  });

  it('masque le bouton « Passer » sur la dernière diapositive', async () => {
    const { user } = await mount();

    await user.press(screen.getByRole('button', { name: 'Suivant' }));
    await user.press(screen.getByRole('button', { name: 'Suivant' }));

    expect(screen.queryByRole('button', { name: 'Passer' })).toBeNull();
  });
});
