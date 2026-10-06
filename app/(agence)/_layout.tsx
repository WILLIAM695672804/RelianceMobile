import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Équipe de l'agence. */
export default function AgenceLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="agency/team/[id]" />
    </Stack>
  );
}
