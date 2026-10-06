import Constants from 'expo-constants';
import { getLocales } from 'expo-localization';

import { nativeCookieReader } from '@/core/api';
import { appEnv } from '@/core/config';
import { createLanguagePreference, resolveLanguage } from '@/core/i18n';
import { startConnectivitySync } from '@/core/offline';
import { createMmkvStore } from '@/core/storage';
import { agencyTranslations } from '@/features/agency';
import { authTranslations } from '@/features/auth';
import { billingTranslations } from '@/features/billing';
import { chatTranslations } from '@/features/chat';
import { directoryTranslations } from '@/features/directory';
import { kycTranslations } from '@/features/kyc';
import { matchingTranslations } from '@/features/matching';
import { missionsTranslations } from '@/features/missions';
import { notificationsTranslations } from '@/features/notifications';
import { planningTranslations } from '@/features/planning';
import { profileTranslations } from '@/features/profile';
import { requestsTranslations } from '@/features/requests';
import { socialTranslations } from '@/features/social';
import { reviewsTranslations } from '@/features/reviews';
import { walletTranslations } from '@/features/wallet';

import { createServices } from './createServices';

startConnectivitySync();

/** Langue choisie dans les paramètres ; stockage distinct, conservé à la déconnexion. */
export const languagePreference = createLanguagePreference(createMmkvStore('reliance.preferences'));

/** Services de l'application, créés une fois au chargement du module. */
export const services = createServices({
  env: appEnv,
  cookies: nativeCookieReader,
  sessionStorage: createMmkvStore('reliance.session'),
  cacheStorage: createMmkvStore('reliance.query-cache'),
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  language:
    languagePreference.read() ?? resolveLanguage(getLocales().map((locale) => locale.languageTag)),
  translations: [
    authTranslations,
    profileTranslations,
    kycTranslations,
    requestsTranslations,
    matchingTranslations,
    missionsTranslations,
    billingTranslations,
    notificationsTranslations,
    chatTranslations,
    walletTranslations,
    reviewsTranslations,
    planningTranslations,
    agencyTranslations,
    socialTranslations,
    directoryTranslations,
  ],
});
