import { createMemoryStore } from '@/core/storage';

import { createOnboardingFlag } from './onboardingSeen';

describe('createOnboardingFlag', () => {
  it('est faux avant toute visite', () => {
    expect(createOnboardingFlag(createMemoryStore()).seen()).toBe(false);
  });

  it('retient la visite, y compris après un nouveau démarrage', () => {
    const store = createMemoryStore();
    createOnboardingFlag(store).markSeen();

    expect(createOnboardingFlag(store).seen()).toBe(true);
  });

  it('ignore une valeur illisible', () => {
    const store = createMemoryStore();
    store.set('auth.onboarding.seen', 'peut-être');

    expect(createOnboardingFlag(store).seen()).toBe(false);
  });
});
