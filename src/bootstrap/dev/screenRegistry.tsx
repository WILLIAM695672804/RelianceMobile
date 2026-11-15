import type { ReactElement } from 'react';

import { LoginView, OnboardingView, RoleSelectView } from '@/features/auth';
import { NotificationsView } from '@/features/notifications';
import notificationsFixture from '@/test/fixtures/notifications/notifications.json';

import { TabBarDemo } from './TabBarDemo';

/** Écran de présentation affiché dans le catalogue, alimenté par une fixture capturée. */
export interface CatalogueEntry {
  key: string;
  /** Lot de la refonte auquel l'écran appartient. */
  lot: string;
  label: string;
  render: (close: () => void) => ReactElement;
}

const noop = () => undefined;

/** Les fixtures sont des captures anonymisées du serveur local (`scripts/capture-*.sh`). */
export const CATALOGUE_SCREENS: readonly CatalogueEntry[] = [
  {
    key: 'barre',
    lot: 'L1',
    label: 'Barre de navigation',
    render: (close) => <TabBarDemo onClose={close} />,
  },
  {
    key: 'onboarding',
    lot: 'L2',
    label: 'Onboarding',
    render: (close) => <OnboardingView onFinish={close} onSkip={close} />,
  },
  {
    key: 'role',
    lot: 'L2',
    label: 'Choix du rôle',
    render: (close) => <RoleSelectView onSelect={close} onSignIn={close} />,
  },
  {
    key: 'connexion',
    lot: 'L2',
    label: 'Connexion (avec erreurs)',
    render: (close) => (
      <LoginView
        step="credentials"
        submitting={false}
        sessionExpired
        formError="Adresse électronique ou mot de passe incorrect."
        onSubmitCredentials={noop}
        onSubmitCode={noop}
        onBackToCredentials={noop}
        onForgotPassword={noop}
        onRegister={noop}
        onBack={close}
      />
    ),
  },
  {
    key: 'connexion-2fa',
    lot: 'L2',
    label: 'Connexion · double authentification',
    render: (close) => (
      <LoginView
        step="twoFactor"
        submitting={false}
        onSubmitCredentials={noop}
        onSubmitCode={noop}
        onBackToCredentials={close}
        onForgotPassword={noop}
        onRegister={noop}
        onBack={close}
      />
    ),
  },
  {
    key: 'notifications',
    lot: 'L2',
    label: 'Centre de notifications',
    render: (close) => (
      <NotificationsView
        status="ready"
        notifications={notificationsFixture.data}
        now={new Date(notificationsFixture.data[0]?.created_at ?? Date.now())}
        onBack={close}
        onRetry={noop}
        onMarkAll={noop}
        onOpen={noop}
      />
    ),
  },
];
