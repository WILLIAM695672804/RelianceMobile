import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useTheme } from '@/core/theme';
import {
  useAccount,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useGenerateTwoFactor,
} from '@/features/auth';
import { FormField } from '@/shared/forms';
import { Banner, Button, ListRow, Text } from '@/shared/ui';

import { twoFactorFormSchema } from '../schemas/profileSchemas';

type Step = { kind: 'idle' } | { kind: 'enabling'; secret: string } | { kind: 'disabling' };

export interface TwoFactorSectionProps {
  /** Message de réussite, affiché par l'écran parent. */
  onSuccess: (message: string) => void;
}

/**
 * Activation et désactivation de la double authentification.
 * Le secret est présenté en clair pour une saisie manuelle : le QR code SVG n'est pas rendu.
 */
export function TwoFactorSection({ onSuccess }: TwoFactorSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount();
  const generate = useGenerateTwoFactor();
  const enable = useEnableTwoFactor();
  const disable = useDisableTwoFactor();
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(twoFactorFormSchema), defaultValues: { code: '' } });

  if (account.isPending) {
    return (
      <ActivityIndicator
        style={{ padding: 16 }}
        color={theme.colors.primary}
        accessibilityLabel={t('common:states.loading')}
      />
    );
  }
  if (account.isError) {
    return (
      <View style={{ padding: 16, gap: 8 }}>
        <Banner tone="danger" message={describeError(normalizeError(account.error), t)} />
        <Button
          label={t('common:actions.retry')}
          variant="ghost"
          onPress={() => void account.refetch()}
        />
      </View>
    );
  }

  const enabled = account.data.two_factor_enabled === true;
  const fail = (cause: unknown) => setError(describeError(normalizeError(cause), t));

  const reset = () => {
    setStep({ kind: 'idle' });
    setError(null);
    form.reset();
  };

  const start = async () => {
    setError(null);
    if (enabled) {
      setStep({ kind: 'disabling' });
      return;
    }
    try {
      const setup = await generate.mutateAsync();
      setStep({ kind: 'enabling', secret: setup.secret });
    } catch (cause) {
      fail(cause);
    }
  };

  const confirm = form.handleSubmit(async ({ code }) => {
    setError(null);
    try {
      if (step.kind === 'enabling') {
        await enable.mutateAsync(code);
        onSuccess(t('profile:settings.twoFactorEnabled'));
      } else {
        await disable.mutateAsync(code);
        onSuccess(t('profile:settings.twoFactorDisabled'));
      }
      reset();
    } catch (cause) {
      fail(cause);
    }
  });

  return (
    <View>
      <ListRow
        icon="shield"
        title={t('profile:settings.twoFactor')}
        detail={t(enabled ? 'profile:settings.twoFactorOn' : 'profile:settings.twoFactorOff')}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
        {error ? <Banner tone="danger" message={error} /> : null}
        {step.kind === 'idle' ? (
          <Button
            label={t(
              enabled ? 'profile:settings.twoFactorDisable' : 'profile:settings.twoFactorEnable',
            )}
            variant="soft"
            full
            onPress={() => void start()}
            loading={generate.isPending}
          />
        ) : (
          <>
            {step.kind === 'enabling' ? (
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surfaceMuted,
                  gap: 6,
                }}
              >
                <Text variant="caption" tone="muted">
                  {t('profile:settings.twoFactorSecretHint')}
                </Text>
                <Text variant="bodyStrong" selectable>
                  {step.secret}
                </Text>
              </View>
            ) : null}
            <FormField
              control={form.control}
              name="code"
              label={t('profile:settings.twoFactorCode')}
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />
            <Button
              label={t('profile:settings.twoFactorConfirm')}
              full
              onPress={() => void confirm()}
              loading={enable.isPending || disable.isPending}
            />
            <Button label={t('common:actions.cancel')} variant="ghost" full onPress={reset} />
          </>
        )}
      </View>
    </View>
  );
}
