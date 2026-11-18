import { router, useLocalSearchParams } from 'expo-router';

import { TechnicianOfferScreen } from '@/features/matching';

export default function TechnicianOfferRoute() {
  const { id, technicianId } = useLocalSearchParams<{ id: string; technicianId: string }>();
  return (
    <TechnicianOfferScreen
      requestId={id}
      technicianId={technicianId}
      onSent={() => router.dismissTo({ pathname: '/requests/[id]', params: { id } })}
      onBack={() => router.back()}
    />
  );
}
