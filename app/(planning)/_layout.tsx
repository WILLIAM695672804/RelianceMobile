import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Planning du technicien et rendez-vous des deux rôles. */
export default function PlanningLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="planning/index" />
      <Stack.Screen name="planning/time-slots" />
      <Stack.Screen name="planning/exceptions" />
      <Stack.Screen name="appointments/index" />
      <Stack.Screen name="appointments/new" />
    </Stack>
  );
}
