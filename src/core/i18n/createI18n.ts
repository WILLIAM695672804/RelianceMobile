import { createInstance, type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './resources/en';
import { fr } from './resources/fr';

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Arborescence de traductions d'un namespace. */
export interface TranslationTree {
  [key: string]: string | TranslationTree;
}

/** Ressources d'une feature : langue → namespace → arborescence. */
export type TranslationResources = Record<Language, Record<string, TranslationTree>>;

export const isSupportedLanguage = (code: string): code is Language =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

/** Première langue prise en charge parmi les préférences de l'appareil ; `fr` à défaut. */
export function resolveLanguage(tags: readonly (string | null | undefined)[]): Language {
  for (const tag of tags) {
    const code = tag?.split('-')[0]?.toLowerCase();
    if (code && isSupportedLanguage(code)) return code;
  }
  return 'fr';
}

/**
 * Crée une instance i18next initialisée de façon synchrone.
 * @param extra ressources des features, fusionnées par langue et par namespace.
 */
export function createI18n(extra: TranslationResources[] = [], language: Language = 'fr'): I18n {
  const resources: TranslationResources = { fr: { ...fr }, en: { ...en } };
  for (const bundle of extra) {
    for (const lang of SUPPORTED_LANGUAGES) {
      Object.assign(resources[lang], bundle[lang]);
    }
  }

  const instance = createInstance();
  void instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'fr',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    resources,
    ns: Object.keys(resources.fr),
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    initAsync: false,
    returnNull: false,
  });
  return instance;
}
