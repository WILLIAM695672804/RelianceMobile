import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import { Banner, Button, Screen, TopBar } from '@/shared/ui';

import { useChangePassword } from '../hooks/useProfileMutations';
import { passwordFormSchema } from '../schemas/profileSchemas';

export interface ChangePasswordScreenProps {
  /** Appelé après une modification réussie. */
  onDone: () => void;
  onBack?: () => void;
}

/** Changement du mot de passe (E09). */
export function ChangePasswordScreen({ onDone, onBack }: ChangePasswordScreenProps) {
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
    <Screen
      testID="mot-de-passe"
      footer={
        <Button
          label={t('profile:password.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={changePassword.isPending}
        />
      }
    >
      <TopBar title={t('profile:password.title')} onBack={onBack ?? onDone} />
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        <FormField
          control={form.control}
          name="current_password"
          label={t('profile:password.current')}
          icon="shield"
          secure
          autoComplete="current-password"
        />
        <FormField
          control={form.control}
          name="new_password"
          label={t('profile:password.new')}
          icon="shield"
          secure
          autoComplete="new-password"
        />
        <FormField
          control={form.control}
          name="new_password_confirmation"
          label={t('profile:password.confirmation')}
          icon="shield"
          secure
          autoComplete="new-password"
        />
      </View>
    </Screen>
  );
}
