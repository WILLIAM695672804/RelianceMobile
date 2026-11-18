import { router, useLocalSearchParams } from 'expo-router';

import { TechProfileContainer } from '@/bootstrap/containers/TechProfileContainer';
import { useSession } from '@/core/session';

export default function TechnicianProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useSession((state) => state.user?.role ?? null);
  const message = (member: string) =>
    router.push({ pathname: '/conversations/new', params: { member } });
  return (
    <TechProfileContainer
      technicianId={id}
      onBack={() => router.back()}
      onMessage={message}
      // Seul un client réserve : les autres rôles écrivent au technicien.
      onBook={() => (role === 'client' ? router.push('/requests/new') : message(id))}
    />
  );
}
