import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { useChangePassword } from '../hooks/useProfileMutations';
import { passwordFormSchema } from '../schemas/profileSchemas';

export interface ChangePasswordScreenProps {
  /** Appelé après une modification réussie. */
  onDone: () => void;
}

/** Changement du mot de passe (E09). */
export function ChangePasswordScreen({ onDone }: ChangePasswordScreenProps) {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { current_password: '', new_password: '', new_password_confirmation: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await changePassword.mutateAsync(values);
      onDone();
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('profile:password.title')}
      </Text>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      <FormTextField
        control={form.control}
        name="current_password"
        label={t('profile:password.current')}
        secureTextEntry
        autoComplete="current-password"
      />
      <FormTextField
        control={form.control}
        name="new_password"
        label={t('profile:password.new')}
        secureTextEntry
        autoComplete="new-password"
      />
      <FormTextField
        control={form.control}
        name="new_password_confirmation"
        label={t('profile:password.confirmation')}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button
        label={t('profile:password.submit')}
        onPress={() => void onSubmit()}
        loading={changePassword.isPending}
      />
    </Screen>
  );
}
