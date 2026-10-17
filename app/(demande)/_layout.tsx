import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Parcours d'une demande côté client : création (E10), détail, rapprochement (E11), offre (E12). */
export default function DemandeLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerBackTitle: t('common:actions.back'),
      }}
    >
      <Stack.Screen name="requests/index" />
      <Stack.Screen name="requests/new" />
      <Stack.Screen name="requests/[id]/index" />
      <Stack.Screen name="requests/[id]/matching" />
      <Stack.Screen name="requests/[id]/technicians/[technicianId]" />
      <Stack.Screen name="requests/[id]/report" />
    </Stack>
  );
}
