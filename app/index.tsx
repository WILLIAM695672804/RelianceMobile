import { Redirect, type Href } from 'expo-router';

import { LaunchScreen } from '@/bootstrap/screens/LaunchScreen';
import { PROTOTYPE_ENABLED } from '@/prototype/flag';

export default function LaunchRoute() {
  if (PROTOTYPE_ENABLED) return <Redirect href={'/prototype' as Href} />;
  return <LaunchScreen />;
}
