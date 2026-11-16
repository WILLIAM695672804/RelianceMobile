import { router } from 'expo-router';

import { ForgotPasswordContainer } from '@/features/auth';

export default function ForgotPasswordRoute() {
  return (
    <ForgotPasswordContainer
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
    />
  );
}
