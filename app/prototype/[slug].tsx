import { useLocalSearchParams } from 'expo-router';

import { PrototypeScreen } from '@/prototype/screens';

/**
 * Écran empilé du prototype. Le segment s'appelle `slug` et non `screen` : React Navigation
 * réserve le paramètre `screen` à la navigation vers un écran imbriqué.
 */
export default function PrototypeStackScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <PrototypeScreen key={slug} name={slug ?? 'onboarding'} />;
}
