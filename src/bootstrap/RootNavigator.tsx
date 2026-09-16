import { Stack } from 'expo-router';

import { computeGuards, useSession } from '@/core/session';

import { RealtimeBridge } from './RealtimeBridge';

/** Navigateur racine : chaque espace n'est accessible que si sa garde est vraie. */
export function RootNavigator() {
  const status = useSession((state) => state.status);
  const user = useSession((state) => state.user);
  const guards = computeGuards({ status, user });

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={guards.isBooting}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isGuest}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isClient}>
          <Stack.Screen name="client" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isTechnicien}>
          <Stack.Screen name="technicien" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isAgence}>
          <Stack.Screen name="agence" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isMember}>
          <Stack.Screen name="(profil)" />
        </Stack.Protected>
        <Stack.Protected guard={guards.isWebOnly}>
          <Stack.Screen name="web-only" />
        </Stack.Protected>
      </Stack>
      <RealtimeBridge />
    </>
  );
}
