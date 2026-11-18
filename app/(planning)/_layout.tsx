import { Stack } from 'expo-router';

/** Planning du technicien et rendez-vous des deux rôles. */
export default function PlanningLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="planning/index" />
      <Stack.Screen name="planning/time-slots" />
      <Stack.Screen name="planning/exceptions" />
      <Stack.Screen name="appointments/index" />
      <Stack.Screen name="appointments/new" />
    </Stack>
  );
}
