import { Stack } from 'expo-router';

/** Litiges : liste, ouverture et fil d'un dossier. */
export default function LitigesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="disputes/index" />
      <Stack.Screen name="disputes/new" />
      <Stack.Screen name="disputes/[id]" />
    </Stack>
  );
}
