import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { useToast } from '@/shared/ui';

import type { LoginPayload } from '../api/authApi';
import { useLogin } from '../hooks/useAuthMutations';
import { useChosenRole } from '../model/chosenRole';
import { registrationUrl } from '../model/registrationUrl';
import type { LoginFormValues } from '../schemas/authSchemas';
import { LoginView, type LoginViewProps } from '../ui/LoginView';

export interface LoginContainerProps {
  /** Racine de l'application web (inscription) ; `null` si non configurée. */
  webUrl: string | null;
  onForgotPassword: () => void;
  onLegal?: (kind: 'terms' | 'privacy') => void;
  onBack?: () => void;
}

/** Connexion branchée sur l'API, double authentification comprise. */
export function LoginContainer({ webUrl, onForgotPassword, onLegal, onBack }: LoginContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const expired = useSession((state) => state.expired);
  const acknowledgeExpiry = useSession((state) => state.acknowledgeExpiry);
  const role = useChosenRole((state) => state.role);
  const login = useLogin();
  const [pending, setPending] = useState<LoginFormValues | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginViewProps['fieldErrors']>();

  const submit = async (payload: LoginPayload) => {
    setFormError(null);
    setFieldErrors(undefined);
    acknowledgeExpiry();
    try {
      await login.mutateAsync(payload);
    } catch (error) {
      const appError = normalizeError(error);
      if (appError.kind === 'twoFactorRequired') {
        setPending({ email: payload.email, password: payload.password });
      } else if (appError.kind === 'unauthenticated') {
        setFormError(
          t(payload.code ? 'auth:login.twoFactorInvalid' : 'auth:login.invalidCredentials'),
        );
      } else if (appError.kind === 'forbidden') {
        setFormError(t('auth:login.accountDisabled'));
      } else if (appError.kind === 'validation') {
        setFieldErrors({
          email: appError.fieldErrors.email?.[0],
          password: appError.fieldErrors.password?.[0],
        });
        if (appError.fieldErrors.code?.[0]) setFormError(appError.fieldErrors.code[0]);
      } else {
        setFormError(describeError(appError, t));
      }
    }
  };

  const openRegistration = () => {
    const url = registrationUrl(webUrl, role);
    if (!url) {
      toast.show({ kind: 'warning', title: t('auth:access.signIn.registerUnavailable') });
      return;
    }
    void Linking.openURL(url);
  };

  return (
    <LoginView
      step={pending ? 'twoFactor' : 'credentials'}
      submitting={login.isPending}
      formError={formError}
      fieldErrors={fieldErrors}
      sessionExpired={expired}
      onSubmitCredentials={(values) => void submit(values)}
      onSubmitCode={(code) => (pending ? void submit({ ...pending, code }) : undefined)}
      onBackToCredentials={() => {
        setPending(null);
        setFormError(null);
      }}
      onForgotPassword={onForgotPassword}
      onRegister={openRegistration}
      onLegal={onLegal}
      onBack={onBack}
    />
  );
}
