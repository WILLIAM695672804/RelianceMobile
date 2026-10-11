import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { tabIcon, useTabBarStyle } from '@/bootstrap/navigation/tabOptions';

/** Espace agence : l'accueil est le tableau de bord de l'agence. */
export default function AgenceLayout() {
  const { t } = useTranslation();
  const screenOptions = useTabBarStyle();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: t('common:navigation.agency'), tabBarIcon: tabIcon('shield') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t('common:navigation.account'), tabBarIcon: tabIcon('user') }}
      />
    </Tabs>
  );
}
