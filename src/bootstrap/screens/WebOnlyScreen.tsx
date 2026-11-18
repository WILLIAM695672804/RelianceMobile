import { Linking } from 'react-native';

import { useSession, useSessionActions } from '@/core/session';

import { WebOnlyView } from './WebOnlyView';

export interface WebOnlyScreenProps {
  /** Adresse de la plateforme web ; absente, l'ouverture n'est pas proposée. */
  webUrl?: string | null;
}

/** Administrateur (espace web) ou rôle non reconnu (Document 5, ch. 3). */
export function WebOnlyScreen({ webUrl = null }: WebOnlyScreenProps) {
  const role = useSession((state) => state.user?.role);
  const { logout } = useSessionActions();

  return (
    <WebOnlyView
      reason={role === 'admin' ? 'admin' : 'unknown'}
      onLogout={() => void logout()}
      onOpenWeb={webUrl ? () => void Linking.openURL(webUrl) : undefined}
    />
  );
}
