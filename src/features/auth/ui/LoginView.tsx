import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import { Banner, Button, Field, Icon, Screen, Text } from '@/shared/ui';

import { loginFormSchema, twoFactorCodeSchema, type LoginFormValues } from '../schemas/authSchemas';

export type LoginStep = 'credentials' | 'twoFactor';

export interface LoginViewProps {
  step: LoginStep;
  submitting: boolean;
  /** Message d'échec général, déjà traduit. */
  formError?: string | null;
  /** Erreurs de champ renvoyées par le serveur (422), déjà traduites. */
  fieldErrors?: Partial<Record<keyof LoginFormValues, string>>;
  /** La session précédente a expiré. */
  sessionExpired?: boolean;
  onSubmitCredentials: (values: LoginFormValues) => void;
  onSubmitCode: (code: string) => void;
  onBackToCredentials: () => void;
  onForgotPassword: () => void;
  /** Création de compte : ouvre l'inscription du site web. */
  onRegister: () => void;
  onBack?: () => void;
}

/** Connexion (maquette `LoginScreen`), avec l'étape de double authentification. */
export function LoginView(props: LoginViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { step, formError, sessionExpired, onBack } = props;
  const twoFactor = step === 'twoFactor';

  return (
    <Screen testID="connexion">
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, minHeight: 56 }}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common:actions.back')}
            onPress={onBack}
            hitSlop={(MIN_TOUCH_TARGET - 40) / 2}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chevronL" size={18} />
          </Pressable>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24, gap: 6 }}>
        <Text variant="display" accessibilityRole="header" style={{ letterSpacing: -0.8 }}>
          {t(twoFactor ? 'auth:access.signIn.twoFactorTitle' : 'auth:access.signIn.title')}
        </Text>
        <Text variant="body" tone="muted" style={{ fontSize: 14 }}>
          {t(twoFactor ? 'auth:access.signIn.twoFactorHint' : 'auth:access.signIn.subtitle')}
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, gap: 14 }}>
        {sessionExpired ? <Banner tone="warning" message={t('common:session.expired')} /> : null}
        {formError ? <Banner tone="danger" message={formError} /> : null}
        {twoFactor ? <CodeForm {...props} /> : <CredentialsForm {...props} />}
      </View>

      {twoFactor ? null : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
        >
          <Text variant="label" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
            {t('auth:access.signIn.notMember')}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={props.onRegister}
            style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', paddingHorizontal: 4 }}
          >
            <Text variant="labelStrong">{t('auth:access.signIn.register')}</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

function CredentialsForm({
  submitting,
  fieldErrors,
  onSubmitCredentials,
  onForgotPassword,
}: LoginViewProps) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });
  const [email, password] = useWatch({ control: form.control, name: ['email', 'password'] });
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const errorOf = (name: keyof LoginFormValues) => {
    const local = form.formState.errors[name]?.message;
    return fieldErrors?.[name] ?? (local ? t(local) : undefined);
  };

  return (
    <>
      <Controller
        control={form.control}
        name="email"
        render={({ field }) => (
          <Field
            label={t('auth:access.signIn.email')}
            icon="user"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder={t('auth:access.signIn.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errorOf('email')}
          />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field }) => (
          <Field
            label={t('auth:access.signIn.password')}
            icon="shield"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secure
            autoComplete="password"
            error={errorOf('password')}
          />
        )}
      />
      <View style={{ alignItems: 'flex-end', marginTop: -4 }}>
        <Pressable
          accessibilityRole="link"
          onPress={onForgotPassword}
          style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}
        >
          <Text variant="label" tone="primary">
            {t('auth:access.signIn.forgotPassword')}
          </Text>
        </Pressable>
      </View>
      <Button
        label={t('auth:access.signIn.submit')}
        size="lg"
        full
        disabled={!canSubmit}
        loading={submitting}
        onPress={() => void form.handleSubmit((values) => onSubmitCredentials(values))()}
      />
    </>
  );
}

function CodeForm({ submitting, onSubmitCode, onBackToCredentials }: LoginViewProps) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(twoFactorCodeSchema),
    defaultValues: { code: '' },
  });
  const local = form.formState.errors.code?.message;
  return (
    <>
      <Controller
        control={form.control}
        name="code"
        render={({ field }) => (
          <Field
            label={t('auth:access.signIn.twoFactorCode')}
            icon="shield"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            error={local ? t(local) : undefined}
          />
        )}
      />
      <Button
        label={t('auth:access.signIn.twoFactorSubmit')}
        size="lg"
        full
        loading={submitting}
        onPress={() => void form.handleSubmit(({ code }) => onSubmitCode(code))()}
      />
      <Button
        label={t('auth:access.signIn.back')}
        variant="ghost"
        full
        onPress={onBackToCredentials}
      />
    </>
  );
}
