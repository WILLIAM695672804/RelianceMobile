import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Centre de notifications et préférences de canaux. */
export default function NotificationsLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notification-settings" />
    </Stack>
  );
}
