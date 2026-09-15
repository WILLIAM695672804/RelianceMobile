import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ClientLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('common:navigation.home') }} />
      <Tabs.Screen name="account" options={{ title: t('common:navigation.account') }} />
    </Tabs>
  );
}
