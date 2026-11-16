import { Stack } from 'expo-router';

import { onboardingFlag } from '@/bootstrap/instance';
import { OnboardingGate } from '@/bootstrap/screens/OnboardingGate';

export default function AuthLayout() {
  return (
    <OnboardingGate flag={onboardingFlag}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </OnboardingGate>
  );
}
