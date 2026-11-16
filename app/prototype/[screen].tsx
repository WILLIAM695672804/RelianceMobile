import { useLocalSearchParams } from 'expo-router';

import { PrototypeScreen } from '@/prototype/screens';

export default function PrototypeStackScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  return <PrototypeScreen key={screen} name={screen ?? 'onboarding'} />;
}
