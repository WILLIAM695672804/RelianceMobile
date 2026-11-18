import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Devis d'une demande et factures, communs au client et au technicien. */
export default function FacturationLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="quotes/[requestId]" />
      <Stack.Screen name="invoices/index" />
      <Stack.Screen name="invoices/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
