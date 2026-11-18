import { router } from 'expo-router';

import { ClientHomeContainer } from '@/bootstrap/containers/ClientHomeContainer';

export default function ClientHomeRoute() {
  return (
    <ClientHomeContainer
      onNotifications={() => router.push('/notifications')}
      onNewRequest={(category) =>
        router.push(
          category ? { pathname: '/requests/new', params: { category } } : '/requests/new',
        )
      }
      onAllCategories={() => router.push('/search')}
      onMap={() => router.navigate('/client/map')}
      onTech={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
      onAllTechs={() => router.navigate('/client/annuaire')}
      onOpenRequest={() => router.navigate('/client/suivi')}
      onChat={() => router.navigate('/client/inbox')}
    />
  );
}
