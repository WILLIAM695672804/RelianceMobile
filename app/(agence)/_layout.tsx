import { Stack } from 'expo-router';

/** Équipe de l'agence. */
export default function AgenceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="agency/team/[id]" />
    </Stack>
  );
}
