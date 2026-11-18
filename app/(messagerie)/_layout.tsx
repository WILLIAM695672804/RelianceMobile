import { Stack } from 'expo-router';

/** Messagerie : liste des conversations, fil de discussion, ouverture d'un fil. */
export default function MessagerieLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="conversations/index" />
      <Stack.Screen name="conversations/[id]" />
      <Stack.Screen name="conversations/new" />
    </Stack>
  );
}
