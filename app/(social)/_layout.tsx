import { Stack } from 'expo-router';

/** Fil social et détail d'une publication. */
export default function SocialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="feed" />
      <Stack.Screen name="posts/[id]" />
      <Stack.Screen name="compose" />
    </Stack>
  );
}
