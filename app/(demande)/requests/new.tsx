import { router, useLocalSearchParams } from 'expo-router';

import { NewRequestContainer } from '@/features/requests';

export default function NewRequestRoute() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  return (
    <NewRequestContainer
      domain={category ?? null}
      onCreated={(id) => router.replace({ pathname: '/requests/[id]/matching', params: { id } })}
      onBack={() => router.back()}
    />
  );
}
