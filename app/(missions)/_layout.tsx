import { Stack } from 'expo-router';

/** Historique et détail des missions du technicien. */
export default function MissionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="jobs/index" />
      <Stack.Screen name="jobs/[id]" />
      <Stack.Screen name="reports/[jobId]" />
      <Stack.Screen name="cancel/[jobId]" />
    </Stack>
  );
}
