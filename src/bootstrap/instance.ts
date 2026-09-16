import Constants from 'expo-constants';
import { getLocales } from 'expo-localization';

import { nativeCookieReader } from '@/core/api';
import { appEnv } from '@/core/config';
import { resolveLanguage } from '@/core/i18n';
import { startConnectivitySync } from '@/core/offline';
import { createMmkvStore } from '@/core/storage';
import { authTranslations } from '@/features/auth';

import { createServices } from './createServices';

startConnectivitySync();

/** Services de l'application, créés une fois au chargement du module. */
export const services = createServices({
  env: appEnv,
  cookies: nativeCookieReader,
  sessionStorage: createMmkvStore('reliance.session'),
  cacheStorage: createMmkvStore('reliance.query-cache'),
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  language: resolveLanguage(getLocales().map((locale) => locale.languageTag)),
  translations: [authTranslations],
});
