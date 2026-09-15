import { router } from 'expo-router';

import { LoginScreen } from '@/features/auth';

export default function LoginRoute() {
  return (
    <LoginScreen
      onRegister={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
