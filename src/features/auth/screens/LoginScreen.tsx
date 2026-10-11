import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import type { LoginPayload } from '../api/authApi';
import { useLogin } from '../hooks/useAuthMutations';
import { loginFormSchema, twoFactorCodeSchema, type LoginFormValues } from '../schemas/authSchemas';

export interface LoginScreenProps {
  onRegister: () => void;
  onForgotPassword: () => void;
}

/** E02 — Connexion, avec étape de vérification en deux étapes si le compte l'exige. */
export function LoginScreen({ onRegister, onForgotPassword }: LoginScreenProps) {
  const { t } = useTranslation();
  const expired = useSession((state) => state.expired);
  const acknowledgeExpiry = useSession((state) => state.acknowledgeExpiry);
  const loginMutation = useLogin();
  const [pendingCredentials, setPendingCredentials] = useState<LoginFormValues | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const credentialsForm = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });
  const codeForm = useForm({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: { code: '' },
  });
  const [email, password] = useWatch({
    control: credentialsForm.control,
    name: ['email', 'password'],
  });
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const submit = async (payload: LoginPayload) => {
    setFormError(null);
    acknowledgeExpiry();
    try {
      await loginMutation.mutateAsync(payload);
    } catch (error) {
      const appError = normalizeError(error);
      if (appError.kind === 'twoFactorRequired') {
        setPendingCredentials({ email: payload.email, password: payload.password });
      } else if (appError.kind === 'unauthenticated') {
        setFormError(
          t(payload.code ? 'auth:login.twoFactorInvalid' : 'auth:login.invalidCredentials'),
        );
      } else if (appError.kind === 'forbidden') {
        setFormError(t('auth:login.accountDisabled'));
      } else if (!applyServerErrors(credentialsForm.setError, appError)) {
        setFormError(describeError(appError, t));
      }
    }
  };

  const onSubmitCredentials = credentialsForm.handleSubmit((values) => submit(values));
  const onSubmitCode = codeForm.handleSubmit(({ code }) =>
    pendingCredentials ? submit({ ...pendingCredentials, code }) : undefined,
  );

  const backToCredentials = () => {
    setPendingCredentials(null);
    setFormError(null);
    codeForm.reset();
  };

  return (
    <Screen scroll>
      <Text variant="display" tone="primary" accessibilityRole="header">
        {t('auth:login.title')}
      </Text>
      <Text tone="muted">{t('auth:login.subtitle')}</Text>
      {expired ? <Text tone="danger">{t('common:session.expired')}</Text> : null}
      {formError ? <Text tone="danger">{formError}</Text> : null}

      {pendingCredentials ? (
        <>
          <Text variant="subtitle">{t('auth:login.twoFactorTitle')}</Text>
          <Text tone="muted">{t('auth:login.twoFactorHint')}</Text>
          <FormTextField
            control={codeForm.control}
            name="code"
            label={t('auth:login.twoFactorCode')}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />
          <Button
            label={t('auth:login.twoFactorSubmit')}
            onPress={() => void onSubmitCode()}
            loading={loginMutation.isPending}
          />
          <Button label={t('common:actions.back')} onPress={backToCredentials} variant="ghost" />
        </>
      ) : (
        <>
          <FormTextField
            control={credentialsForm.control}
            name="email"
            label={t('auth:login.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormTextField
            control={credentialsForm.control}
            name="password"
            label={t('auth:login.password')}
            secureTextEntry
            autoComplete="password"
          />
          <Button
            label={t('auth:login.submit')}
            icon="arrowR"
            size="lg"
            fullWidth
            onPress={() => void onSubmitCredentials()}
            disabled={!canSubmit}
            loading={loginMutation.isPending}
          />
          <Button
            label={t('auth:login.forgotPassword')}
            icon="info"
            onPress={onForgotPassword}
            variant="ghost"
          />
          <Button label={t('auth:login.register')} onPress={onRegister} variant="secondary" />
        </>
      )}
    </Screen>
  );
}
