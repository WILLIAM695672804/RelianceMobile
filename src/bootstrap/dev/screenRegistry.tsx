import type { ReactElement } from 'react';

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
