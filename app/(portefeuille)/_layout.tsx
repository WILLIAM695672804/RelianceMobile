import { Stack } from 'expo-router';

/** Portefeuille, recharge et retrait. */
export default function PortefeuilleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet/index" />
      <Stack.Screen name="wallet/recharge" />
      <Stack.Screen name="wallet/withdraw" />
      <Stack.Screen name="wallet/transactions/[id]" />
      <Stack.Screen name="wallet/payments/[id]" />
    </Stack>
  );
}
