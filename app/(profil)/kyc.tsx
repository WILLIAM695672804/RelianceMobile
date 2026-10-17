import { router } from 'expo-router';

import { KycScreen } from '@/features/kyc';

export default function KycRoute() {
  return <KycScreen onContinue={() => router.push('/setup')} />;
}
