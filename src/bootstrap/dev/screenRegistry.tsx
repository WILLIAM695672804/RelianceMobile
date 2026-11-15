import { useState, type ReactElement } from 'react';

import { ForgotPasswordView, LoginView, OnboardingView, RoleSelectView } from '@/features/auth';
import { SearchView, technicianPageSchema, technicianResult } from '@/features/directory';
import { NotificationSettingsView, NotificationsView } from '@/features/notifications';
import techniciansFixture from '@/test/fixtures/directory/technicians.json';
import notificationsFixture from '@/test/fixtures/notifications/notifications.json';

import { WebOnlyView } from '../screens/WebOnlyView';

import { EmptyStatesGallery, ToastsGallery } from './Galleries';
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
    key: 'recherche',
    lot: 'L2',
    label: 'Recherche · suggestions',
    render: (close) => <SearchDemo onClose={close} />,
  },
  {
    key: 'recherche-resultats',
    lot: 'L2',
    label: 'Recherche · résultats',
    render: (close) => <SearchDemo onClose={close} initialQuery="Tech" />,
  },
  {
    key: 'etats',
    lot: 'L2',
    label: 'États vides & erreurs',
    render: (close) => <EmptyStatesGallery onClose={close} />,
  },
  {
    key: 'toasts',
    lot: 'L2',
    label: 'Toasts & bannières',
    render: (close) => <ToastsGallery onClose={close} />,
  },
  {
    key: 'oubli',
    lot: 'L2',
    label: 'Mot de passe oublié',
    render: (close) => <ForgotDemo onClose={close} />,
  },
  {
    key: 'reglages-notifications',
    lot: 'L2',
    label: 'Réglages des notifications',
    render: (close) => <SettingsDemo onClose={close} />,
  },
  {
    key: 'espace-web',
    lot: 'L2',
    label: 'Espace réservé au web',
    render: (close) => <WebOnlyView reason="admin" onLogout={close} onOpenWeb={noop} />,
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

const DEMO_RESULTS = technicianPageSchema.parse(techniciansFixture).data.map(technicianResult);

/** Recherche animée localement : filtres, saisie et résultats issus de la capture de l'annuaire. */
function SearchDemo({
  onClose,
  initialQuery = '',
}: {
  onClose: () => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<string[]>(['pros']);
  const [recent, setRecent] = useState([
    'Plombier urgence',
    'Caméra de surveillance',
    'Tarif disjoncteur',
  ]);
  const filters = [
    { key: 'pros', label: 'Pros' },
    { key: 'posts', label: 'Posts' },
    { key: 'services', label: 'Services' },
    { key: 'quartier', label: 'Quartier' },
    { key: 'tarif', label: 'Tarif' },
  ].map((filter) => ({ ...filter, selected: selected.includes(filter.key) }));
  const needle = query.trim().toLowerCase();
  return (
    <SearchView
      query={query}
      onQueryChange={setQuery}
      onSubmit={noop}
      filters={filters}
      onToggleFilter={(key) =>
        setSelected((current) =>
          current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
        )
      }
      onClearFilters={() => setSelected([])}
      recent={recent}
      onPickRecent={setQuery}
      onClearRecent={() => setRecent([])}
      trending={[
        { key: 'plomberie', label: 'Plomberie Bastos', detail: '12 pros' },
        { key: 'clim', label: 'Climatisation', detail: '8 pros' },
      ]}
      onPickTrending={noop}
      status="ready"
      results={DEMO_RESULTS.filter((result) => result.title.toLowerCase().includes(needle))}
      onRetry={noop}
      onOpenResult={noop}
      onBrowseCategories={noop}
      onBack={onClose}
    />
  );
}

function ForgotDemo({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<'form' | 'sent'>('form');
  return (
    <ForgotPasswordView
      status={status}
      submitting={false}
      onSubmit={() => setStatus('sent')}
      onBack={onClose}
    />
  );
}

function SettingsDemo({ onClose }: { onClose: () => void }) {
  const initial = { in_app: true, push: true, email: false, sms: true };
  const [channels, setChannels] = useState(initial);
  const [outcome, setOutcome] = useState<'saved' | null>(null);
  const dirty = JSON.stringify(channels) !== JSON.stringify(initial) && outcome === null;
  return (
    <NotificationSettingsView
      status="ready"
      channels={channels}
      dirty={dirty}
      saving={false}
      outcome={outcome}
      onToggle={(channel, value) => {
        setOutcome(null);
        setChannels((current) => ({ ...current, [channel]: value }));
      }}
      onSave={() => setOutcome('saved')}
      onRetry={noop}
      onBack={onClose}
    />
  );
}
