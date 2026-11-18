import { Stack } from 'expo-router';

import { useSession } from '@/core/session';

/** Écrans du profil communs aux rôles ; justificatifs et passage technicien selon le rôle. */
export default function ProfilLayout() {
  const role = useSession((state) => state.user?.role);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="password" />
      <Stack.Screen name="locations" />
      <Stack.Screen name="settings" />
      <Stack.Protected guard={role === 'technicien'}>
        <Stack.Screen name="setup" />
        <Stack.Screen name="professional" />
        <Stack.Screen name="skills" />
        <Stack.Screen name="zone" />
        <Stack.Screen name="kyc" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'client'}>
        <Stack.Screen name="upgrade" />
      </Stack.Protected>
    </Stack>
  );
}
