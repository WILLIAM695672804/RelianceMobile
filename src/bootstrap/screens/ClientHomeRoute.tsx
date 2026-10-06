import { router } from 'expo-router';

import { ClientHomeScreen } from '@/features/requests';

/** Onglet « Accueil » du client : E05 relié aux routes du groupe `app/(demande)`. */
export function ClientHomeRoute() {
  return (
    <ClientHomeScreen
      onNewRequest={() => router.push('/requests/new')}
      onOpenRequest={(id) => router.push({ pathname: '/requests/[id]', params: { id } })}
      onOpenAll={() => router.push('/requests')}
    />
  );
}
