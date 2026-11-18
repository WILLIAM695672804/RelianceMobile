import { Stack } from 'expo-router';

/** Parcours d'une demande côté client : création (E10), détail, rapprochement (E11), offre (E12). */
export default function DemandeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="requests/index" />
      <Stack.Screen name="requests/new" />
      <Stack.Screen name="requests/[id]/index" />
      <Stack.Screen name="requests/[id]/matching" />
      <Stack.Screen name="requests/[id]/technicians/[technicianId]" />
      <Stack.Screen name="requests/[id]/report" />
      <Stack.Screen name="requests/[id]/quality" />
    </Stack>
  );
}
