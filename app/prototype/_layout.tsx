import { Stack } from 'expo-router';

import { PrototypeProvider } from '@/prototype/screens';

export default function PrototypeLayout() {
  return (
    <PrototypeProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </PrototypeProvider>
  );
}
