import { router } from 'expo-router';

import { appEnv } from '@/core/config';
import { LoginContainer } from '@/features/auth';

export default function LoginRoute() {
  return (
    <LoginContainer
      webUrl={appEnv.webUrl}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
