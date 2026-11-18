import { Stack } from 'expo-router';

/** Dépôt d'un avis et avis reçus. */
export default function AvisLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="reviews/new/[requestId]" />
      <Stack.Screen name="my-reviews" />
      <Stack.Screen name="reputation" />
      <Stack.Screen name="badges/[code]" />
    </Stack>
  );
}
