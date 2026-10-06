import { useLocalSearchParams } from 'expo-router';

import { TechnicianPublicProfileScreen } from '@/features/directory';

export default function TechnicianProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TechnicianPublicProfileScreen technicianId={id} />;
}
