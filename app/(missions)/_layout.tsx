import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Historique et détail des missions du technicien. */
export default function MissionsLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="jobs/index" />
      <Stack.Screen name="jobs/[id]" />
      <Stack.Screen name="reports/[jobId]" />
      <Stack.Screen name="cancel/[jobId]" options={{ headerShown: false }} />
    </Stack>
  );
}
