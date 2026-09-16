import type { KeyValueStore } from '@/core/storage';

import { isSupportedLanguage, type Language } from './createI18n';

export const LANGUAGE_PREFERENCE_KEY = 'preferences.language';

/** Langue choisie par l'utilisateur, prioritaire sur celle de l'appareil. */
export interface LanguagePreference {
  read(): Language | null;
  save(language: Language): void;
}

export function createLanguagePreference(store: KeyValueStore): LanguagePreference {
  return {
    read: () => {
      const value = store.getString(LANGUAGE_PREFERENCE_KEY);
      return value !== undefined && isSupportedLanguage(value) ? value : null;
    },
    save: (language) => store.set(LANGUAGE_PREFERENCE_KEY, language),
  };
}
