import type { fr } from './fr';

/** Ressources anglaises du socle ; la forme est imposée par les ressources françaises. */
export const en: typeof fr = {
  common: {
    appName: 'Reliance',
    actions: {
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      logout: 'Sign out',
    },
    states: {
      loading: 'Loading…',
      empty: 'Nothing to display.',
    },
    offline: {
      banner: 'You are offline. Some features are limited.',
    },
    session: {
      expired: 'Your session has expired. Please sign in again.',
      checkConnection: 'Check your connection.',
      webOnly: 'This area is available on the web platform only.',
      unknownRole: 'Your role is not supported by the mobile app.',
    },
    navigation: {
      home: 'Home',
      account: 'Account',
    },
    roles: {
      client: 'Client',
      technicien: 'Technician',
      agence: 'Agency',
      admin: 'Administrator',
      unknown: 'Unknown role',
    },
    placeholder: {
      upcoming: 'Screen planned for a later release.',
    },
    home: {
      greeting: 'Hello, {{name}}',
    },
  },
  errors: {
    network: 'Check your connection.',
    timeout: 'The server is taking too long to respond. Check your connection.',
    unauthenticated: 'Your session has expired. Please sign in again.',
    forbidden: 'You are not allowed to perform this action.',
    emailNotVerified: 'Your email address is not verified.',
    twoFactorRequired: 'A two-factor authentication code is required.',
    notFound: 'Item not found.',
    csrf: 'The request has expired. Please try again.',
    validation: 'Some information is invalid.',
    rateLimited: 'Too many attempts. Please wait before trying again.',
    server: 'An error occurred. Please try again later.',
    contract: 'Unexpected server response.',
    unknown: 'An unexpected error occurred.',
  },
};
