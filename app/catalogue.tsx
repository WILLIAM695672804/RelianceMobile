import { useLocalSearchParams } from 'expo-router';

import { CatalogueScreen } from '@/bootstrap/dev/CatalogueScreen';

export default function CatalogueRoute() {
  const { ecran, theme } = useLocalSearchParams<{ ecran?: string; theme?: string }>();
  return (
    <CatalogueScreen
      initialScreen={ecran}
      initialScheme={theme === 'dark' || theme === 'light' ? theme : undefined}
    />
  );
}
