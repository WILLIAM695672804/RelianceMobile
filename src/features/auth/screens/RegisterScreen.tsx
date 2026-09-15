import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { useTheme } from '@/core/theme';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { useRegister } from '../hooks/useAuthMutations';
import {
  REGISTRABLE_ROLES,
  registerFormSchema,
  toRegisterPayload,
  type RegisterFormValues,
  type RegistrableRole,
} from '../schemas/authSchemas';

export interface RegisterScreenProps {
  onLogin: () => void;
}

const DEFAULT_VALUES: RegisterFormValues = {
  role: 'client',
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  agency_name: '',
  address: '',
  description: '',
  bio: '',
};

function RoleOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onSelect}
      style={[
        styles.option,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
        },
      ]}
    >
      <Text tone={selected ? 'primary' : 'default'}>{label}</Text>
    </Pressable>
  );
}

/** E03 — Inscription client, technicien ou agence ; le backend ouvre la session. */
export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const { t } = useTranslation();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const role = useWatch({ control: form.control, name: 'role' });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(toRegisterPayload(values));
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen scroll>
      <Text variant="display" tone="primary" accessibilityRole="header">
        {t('auth:register.title')}
      </Text>
      {formError ? <Text tone="danger">{formError}</Text> : null}

      <Text tone="muted">{t('auth:register.role')}</Text>
      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <View accessibilityRole="radiogroup" style={styles.options}>
            {REGISTRABLE_ROLES.map((option: RegistrableRole) => (
              <RoleOption
                key={option}
                label={t(`auth:register.roles.${option}`)}
                selected={field.value === option}
                onSelect={() => field.onChange(option)}
              />
            ))}
          </View>
        )}
      />

      <FormTextField
        control={form.control}
        name="name"
        label={t('auth:register.name')}
        autoComplete="name"
      />
      <FormTextField
        control={form.control}
        name="email"
        label={t('auth:register.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormTextField
        control={form.control}
        name="phone"
        label={t('auth:register.phone')}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <FormTextField
        control={form.control}
        name="password"
        label={t('auth:register.password')}
        secureTextEntry
        autoComplete="new-password"
      />
      <FormTextField
        control={form.control}
        name="password_confirmation"
        label={t('auth:register.passwordConfirmation')}
        secureTextEntry
        autoComplete="new-password"
      />

      {role === 'agence' ? (
        <>
          <FormTextField
            control={form.control}
            name="agency_name"
            label={t('auth:register.agencyName')}
          />
          <FormTextField control={form.control} name="address" label={t('auth:register.address')} />
          <FormTextField
            control={form.control}
            name="description"
            label={t('auth:register.description')}
            multiline
          />
        </>
      ) : null}
      {role === 'technicien' ? (
        <FormTextField control={form.control} name="bio" label={t('auth:register.bio')} multiline />
      ) : null}

      <Button
        label={t('auth:register.submit')}
        onPress={() => void onSubmit()}
        loading={registerMutation.isPending}
      />
      <Button label={t('auth:register.haveAccount')} onPress={onLogin} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
});
