import { router } from 'expo-router';

import { ForgotPasswordScreen } from '@/features/auth';

export default function ForgotPasswordRoute() {
  return (
    <ForgotPasswordScreen
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
    />
  );
}
