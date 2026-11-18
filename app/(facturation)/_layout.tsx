import { Stack } from 'expo-router';

/** Devis d'une demande et factures, communs au client et au technicien. */
export default function FacturationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quotes/[requestId]" />
      <Stack.Screen name="invoices/index" />
      <Stack.Screen name="invoices/[id]" />
    </Stack>
  );
}
