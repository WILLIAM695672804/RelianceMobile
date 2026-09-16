import { router } from 'expo-router';

import { NewRequestScreen } from '@/features/requests';

export default function NewRequestRoute() {
  return (
    <NewRequestScreen
      onCreated={(id) => router.replace({ pathname: '/requests/[id]/matching', params: { id } })}
      onCancel={() => router.back()}
    />
  );
}
