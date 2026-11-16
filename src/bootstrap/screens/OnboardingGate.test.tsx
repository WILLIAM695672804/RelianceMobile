import { screen, userEvent } from '@testing-library/react-native';

import { createMemoryStore } from '@/core/storage';
import { authTranslations, createOnboardingFlag, useChosenRole } from '@/features/auth';
import { Text } from '@/shared/ui';
import { renderWithProviders } from '@/test/render';

import { OnboardingGate } from './OnboardingGate';

const child = <Text>Espace invité</Text>;

describe('OnboardingGate', () => {
  beforeEach(() => useChosenRole.setState({ role: 'client' }));

  it('affiche le fil au premier lancement', async () => {
    const flag = createOnboardingFlag(createMemoryStore());
    await renderWithProviders(<OnboardingGate flag={flag}>{child}</OnboardingGate>, {
      translations: [authTranslations],
    });

    expect(screen.getByTestId('onboarding')).toBeOnTheScreen();
    expect(screen.queryByText('Espace invité')).toBeNull();
  });

  it('enchaîne sur le choix du rôle, retient le rôle et la visite', async () => {
    const store = createMemoryStore();
    await renderWithProviders(
      <OnboardingGate flag={createOnboardingFlag(store)}>{child}</OnboardingGate>,
      { translations: [authTranslations] },
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Passer' }));
    expect(screen.getByTestId('choix-role')).toBeOnTheScreen();
    await user.press(screen.getByTestId('role-technicien'));

    expect(screen.getByText('Espace invité')).toBeOnTheScreen();
    expect(useChosenRole.getState().role).toBe('technicien');
    expect(createOnboardingFlag(store).seen()).toBe(true);
  });

  it('mène directement à la connexion par « Connexion »', async () => {
    await renderWithProviders(
      <OnboardingGate flag={createOnboardingFlag(createMemoryStore())}>{child}</OnboardingGate>,
      { translations: [authTranslations] },
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Passer' }));
    await user.press(screen.getByRole('button', { name: 'Connexion' }));

    expect(screen.getByText('Espace invité')).toBeOnTheScreen();
  });

  it('s’efface aux lancements suivants', async () => {
    const store = createMemoryStore();
    createOnboardingFlag(store).markSeen();
    await renderWithProviders(
      <OnboardingGate flag={createOnboardingFlag(store)}>{child}</OnboardingGate>,
      { translations: [authTranslations] },
    );

    expect(screen.getByText('Espace invité')).toBeOnTheScreen();
  });
});
