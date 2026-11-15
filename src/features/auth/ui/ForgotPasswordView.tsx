import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BackButton, Banner, Button, EmptyState, Field, Screen, Text } from '@/shared/ui';

import { forgotPasswordFormSchema } from '../schemas/authSchemas';

export interface ForgotPasswordViewProps {
  /** `sent` : le lien a été demandé ; la réponse du serveur est uniforme, que le compte existe ou non. */
  status: 'form' | 'sent';
  submitting: boolean;
  formError?: string | null;
  /** Erreur de champ renvoyée par le serveur (422), déjà traduite. */
  emailError?: string;
  onSubmit: (email: string) => void;
  onBack: () => void;
}

/** Mot de passe oublié : demande du lien de réinitialisation (sans maquette, style Clean Lavender). */
export function ForgotPasswordView({
  status,
  submitting,
  formError,
  emailError,
  onSubmit,
  onBack,
}: ForgotPasswordViewProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState('');
  const form = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });
  const local = form.formState.errors.email?.message;

  if (status === 'sent') {
    return (
      <Screen testID="mot-de-passe-oublie">
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, minHeight: 56 }}>
          <BackButton onPress={onBack} />
        </View>
        <EmptyState
          icon="send"
          tone="primary"
          title={t('auth:access.forgot.sentTitle')}
          message={t('auth:access.forgot.sentBody', { email: submitted })}
          actionLabel={t('auth:access.forgot.back')}
          onAction={onBack}
        />
      </Screen>
    );
  }

  return (
    <Screen testID="mot-de-passe-oublie">
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, minHeight: 56 }}>
        <BackButton onPress={onBack} />
      </View>
      <View style={{ paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24, gap: 6 }}>
        <Text variant="display" accessibilityRole="header" style={{ letterSpacing: -0.8 }}>
          {t('auth:access.forgot.title')}
        </Text>
        <Text variant="body" tone="muted" style={{ fontSize: 14 }}>
          {t('auth:access.forgot.hint')}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, gap: 14 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <Field
              label={t('auth:access.forgot.email')}
              icon="user"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('auth:access.signIn.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError ?? (local ? t(local) : undefined)}
            />
          )}
        />
        <Button
          label={t('auth:access.forgot.submit')}
          size="lg"
          full
          loading={submitting}
          onPress={() =>
            void form.handleSubmit(({ email }) => {
              setSubmitted(email);
              onSubmit(email);
            })()
          }
        />
      </View>
    </Screen>
  );
}
