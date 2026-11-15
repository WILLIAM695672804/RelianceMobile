import { router } from 'expo-router';

import { KycScreen } from '@/features/kyc';

/** Justificatifs d'identité, reliés au parcours d'installation du technicien. */
export function KycRoute() {
  return <KycScreen onContinue={() => router.push('/setup')} />;
}
