import { createMemoryStore } from '@/core/storage';

import { createLanguagePreference, LANGUAGE_PREFERENCE_KEY } from './languagePreference';

describe('createLanguagePreference', () => {
  it('ne renvoie rien tant qu’aucune langue n’a été choisie', () => {
    expect(createLanguagePreference(createMemoryStore()).read()).toBeNull();
  });

  it('enregistre puis relit la langue choisie', () => {
    const store = createMemoryStore();
    createLanguagePreference(store).save('en');

    expect(store.getString(LANGUAGE_PREFERENCE_KEY)).toBe('en');
    expect(createLanguagePreference(store).read()).toBe('en');
  });

  it('ignore une valeur non prise en charge', () => {
    const store = createMemoryStore();
    store.set(LANGUAGE_PREFERENCE_KEY, 'de');
    expect(createLanguagePreference(store).read()).toBeNull();
  });
});
