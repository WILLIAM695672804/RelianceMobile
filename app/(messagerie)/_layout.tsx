import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Messagerie : liste des conversations, fil de discussion, ouverture d'un fil. */
export default function MessagerieLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="conversations/index" />
      <Stack.Screen name="conversations/[id]" />
      <Stack.Screen name="conversations/new" />
    </Stack>
  );
}
