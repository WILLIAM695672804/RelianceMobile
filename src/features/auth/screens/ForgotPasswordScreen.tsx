import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Screen, Text } from '@/shared/components';

import { useForgotPassword } from '../hooks/useAuthMutations';
import { forgotPasswordFormSchema } from '../schemas/authSchemas';

export interface ForgotPasswordScreenProps {
  onBack: () => void;
}

/** E04 — Demande du lien de réinitialisation (la réinitialisation s'effectue via le lien reçu). */
export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const { t } = useTranslation();
  const forgotMutation = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await forgotMutation.mutateAsync(email);
      setSent(true);
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen scroll>
      <Text variant="display" tone="primary" accessibilityRole="header">
        {t('auth:forgotPassword.title')}
      </Text>
      {sent ? (
        <Card>
          <Text>{t('auth:forgotPassword.sent')}</Text>
        </Card>
      ) : (
        <>
          <Text tone="muted">{t('auth:forgotPassword.hint')}</Text>
          {formError ? <Text tone="danger">{formError}</Text> : null}
          <FormTextField
            control={form.control}
            name="email"
            label={t('auth:forgotPassword.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Button
            label={t('auth:forgotPassword.submit')}
            onPress={() => void onSubmit()}
            loading={forgotMutation.isPending}
          />
        </>
      )}
      <Button label={t('auth:forgotPassword.back')} onPress={onBack} variant="ghost" />
    </Screen>
  );
}
