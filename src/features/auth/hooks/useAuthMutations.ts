import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { useSessionActions } from '@/core/session';

import {
  disableTwoFactor,
  enableTwoFactor,
  forgotPassword,
  generateTwoFactor,
  login,
  register,
  resendVerification,
  resetPassword,
  type LoginPayload,
  type ResetPasswordPayload,
} from '../api/authApi';
import type { RegisterPayload } from '../schemas/authSchemas';
import { authKeys } from './authKeys';

/** Connexion ; en cas de succès, la session bascule et la navigation suit. */
export function useLogin() {
  const api = useApiClient();
  const { signIn } = useSessionActions();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(api, payload),
    onSuccess: (user) => signIn(user),
  });
}

/** Inscription ; le backend ouvre directement la session. */
export function useRegister() {
  const api = useApiClient();
  const { signIn } = useSessionActions();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(api, payload),
    onSuccess: (user) => signIn(user),
  });
}

/** Déconnexion complète (backend, cookies, cache, temps réel). */
export function useLogout() {
  const { logout } = useSessionActions();
  return useMutation({ mutationFn: () => logout() });
}

export function useForgotPassword() {
  const api = useApiClient();
  return useMutation({ mutationFn: (email: string) => forgotPassword(api, email) });
}

export function useResetPassword() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(api, payload),
  });
}

export function useResendVerification() {
  const api = useApiClient();
  return useMutation({ mutationFn: () => resendVerification(api) });
}

export function useGenerateTwoFactor() {
  const api = useApiClient();
  return useMutation({ mutationFn: () => generateTwoFactor(api) });
}

export function useEnableTwoFactor() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => enableTwoFactor(api, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.account() }),
  });
}

export function useDisableTwoFactor() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => disableTwoFactor(api, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.account() }),
  });
}
