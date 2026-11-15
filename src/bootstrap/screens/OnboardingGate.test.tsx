import { screen, userEvent } from '@testing-library/react-native';

import { createOnboardingFlag, authTranslations } from '@/features/auth';
import { Text } from '@/shared/components';
import { createMemoryStore } from '@/core/storage';
import { renderWithProviders } from '@/test/render';

import { OnboardingGate } from './OnboardingGate';

const child = <Text>Connexion</Text>;

describe('OnboardingGate', () => {
  it('affiche le fil au premier lancement', async () => {
    const flag = createOnboardingFlag(createMemoryStore());
    await renderWithProviders(<OnboardingGate flag={flag}>{child}</OnboardingGate>, {
      translations: [authTranslations],
    });

    expect(screen.getByText('Trouvez le bon technicien')).toBeOnTheScreen();
    expect(screen.queryByText('Connexion')).toBeNull();
  });

  it('laisse passer puis retient la visite', async () => {
    const store = createMemoryStore();
    const flag = createOnboardingFlag(store);
    await renderWithProviders(<OnboardingGate flag={flag}>{child}</OnboardingGate>, {
      translations: [authTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Passer' }));

    expect(screen.getByText('Connexion')).toBeOnTheScreen();
    expect(createOnboardingFlag(store).seen()).toBe(true);
  });

  it('s’efface aux lancements suivants', async () => {
    const store = createMemoryStore();
    createOnboardingFlag(store).markSeen();
    await renderWithProviders(
      <OnboardingGate flag={createOnboardingFlag(store)}>{child}</OnboardingGate>,
      { translations: [authTranslations] },
    );

    expect(screen.getByText('Connexion')).toBeOnTheScreen();
  });
});
