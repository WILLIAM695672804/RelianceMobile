import { router, useLocalSearchParams } from 'expo-router';

import { LegalView } from '@/features/legal';

/** `/legal/cgu` ou `/legal/confidentialite`, comme sur le site web. */
export default function LegalRoute() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  return (
    <LegalView
      kind={kind === 'confidentialite' ? 'privacy' : 'terms'}
      onBack={() => router.back()}
    />
  );
}
