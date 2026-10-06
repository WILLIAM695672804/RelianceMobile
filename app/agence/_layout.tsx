import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Espace agence : l'accueil est le tableau de bord de l'agence. */
export default function AgenceLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('common:navigation.agency') }} />
      <Tabs.Screen name="account" options={{ title: t('common:navigation.account') }} />
    </Tabs>
  );
}
