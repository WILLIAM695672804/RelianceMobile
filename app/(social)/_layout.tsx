import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Fil social et détail d'une publication. */
export default function SocialLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="feed" />
      <Stack.Screen name="posts/[id]" />
    </Stack>
  );
}
