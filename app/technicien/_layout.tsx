import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { tabIcon, useTabBarStyle } from '@/bootstrap/navigation/tabOptions';

export default function TechnicienLayout() {
  const { t } = useTranslation();
  const screenOptions = useTabBarStyle();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: t('common:navigation.home'), tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="mission"
        options={{ title: t('common:navigation.mission'), tabBarIcon: tabIcon('wrench') }}
      />
      <Tabs.Screen
        name="activite"
        options={{ title: t('common:navigation.activity'), tabBarIcon: tabIcon('list') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t('common:navigation.account'), tabBarIcon: tabIcon('user') }}
      />
    </Tabs>
  );
}
