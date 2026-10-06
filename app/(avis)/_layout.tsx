import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Dépôt d'un avis et avis reçus. */
export default function AvisLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="reviews/new/[requestId]" />
      <Stack.Screen name="my-reviews" />
    </Stack>
  );
}
