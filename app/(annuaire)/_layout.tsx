import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Profil public d'un technicien, ouvert depuis l'annuaire. */
export default function AnnuaireLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="technicians/[id]" />
    </Stack>
  );
}
