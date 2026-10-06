import { router } from 'expo-router';

import { RequestsListScreen } from '@/features/requests';

export default function RequestsListRoute() {
  return (
    <RequestsListScreen
      onOpenRequest={(id) => router.push({ pathname: '/requests/[id]', params: { id } })}
    />
  );
}
