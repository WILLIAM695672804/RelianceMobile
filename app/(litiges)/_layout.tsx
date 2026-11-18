import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Litiges : liste, ouverture et fil d'un dossier. */
export default function LitigesLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="disputes/index" />
      <Stack.Screen name="disputes/new" options={{ headerShown: false }} />
      <Stack.Screen name="disputes/[id]" />
    </Stack>
  );
}
