import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { tabIcon, useTabBarStyle } from '@/bootstrap/navigation/tabOptions';

export default function ClientLayout() {
  const { t } = useTranslation();
  const screenOptions = useTabBarStyle();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: t('common:navigation.home'), tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="suivi"
        options={{ title: t('common:navigation.tracking'), tabBarIcon: tabIcon('pin') }}
      />
      <Tabs.Screen
        name="annuaire"
        options={{ title: t('common:navigation.directory'), tabBarIcon: tabIcon('grid') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t('common:navigation.account'), tabBarIcon: tabIcon('user') }}
      />
    </Tabs>
  );
}
