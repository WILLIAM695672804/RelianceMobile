import { router } from 'expo-router';

import { KycContainer } from '@/features/kyc';

/** Justificatifs d'identité, reliés au parcours d'installation du technicien. */
export function KycRoute() {
  return <KycContainer onBack={() => router.back()} onDone={() => router.push('/setup')} />;
}
