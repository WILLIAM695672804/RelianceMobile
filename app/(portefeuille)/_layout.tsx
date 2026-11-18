import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Portefeuille, recharge et retrait. */
export default function PortefeuilleLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="wallet/index" />
      <Stack.Screen name="wallet/recharge" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/withdraw" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/transactions/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/payments/[id]" />
    </Stack>
  );
}
