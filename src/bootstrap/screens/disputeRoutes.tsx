import { router, useLocalSearchParams } from 'expo-router';

import { DisputeFormScreen, DisputesScreen, DisputeThreadScreen } from '@/features/disputes';

/** Liste des litiges, reliée au fil de chaque dossier. */
export function DisputesRoute() {
  return (
    <DisputesScreen onOpen={(id) => router.push({ pathname: '/disputes/[id]', params: { id } })} />
  );
}

/** Ouverture d'un litige depuis le contrôle qualité ou le détail d'une demande. */
export function DisputeFormRoute() {
  const { requestId, against } = useLocalSearchParams<{ requestId: string; against: string }>();
  return (
    <DisputeFormScreen
      requestId={requestId}
      against={against}
      onBack={() => router.back()}
      onOpened={(id) => router.replace({ pathname: '/disputes/[id]', params: { id } })}
    />
  );
}

/** Fil d'un litige. */
export function DisputeThreadRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DisputeThreadScreen disputeId={id} onBack={() => router.back()} />;
}
