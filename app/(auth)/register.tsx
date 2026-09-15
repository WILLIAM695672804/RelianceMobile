import { router } from 'expo-router';

import { RegisterScreen } from '@/features/auth';

export default function RegisterRoute() {
  return (
    <RegisterScreen
      onLogin={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
    />
  );
}
