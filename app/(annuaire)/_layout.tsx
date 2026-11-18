import { Stack } from 'expo-router';

/** Profil public d'un technicien, ouvert depuis l'annuaire. */
export default function AnnuaireLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="technicians/[id]" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
