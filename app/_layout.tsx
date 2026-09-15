import { AppProviders } from '@/bootstrap/AppProviders';
import { services } from '@/bootstrap/instance';
import { RootNavigator } from '@/bootstrap/RootNavigator';
import { useAppFonts } from '@/core/theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return null;
  return (
    <AppProviders services={services}>
      <RootNavigator />
    </AppProviders>
  );
}
