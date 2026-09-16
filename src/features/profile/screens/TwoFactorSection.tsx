import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import {
  useAccount,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useGenerateTwoFactor,
} from '@/features/auth';
import { Button, FormTextField, ListItem, StateView, Text } from '@/shared/components';

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
  const account = useAccount();
  const generate = useGenerateTwoFactor();
  const enable = useEnableTwoFactor();
  const disable = useDisableTwoFactor();
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(twoFactorFormSchema), defaultValues: { code: '' } });

  if (account.isPending) return <StateView status="loading" />;
  if (account.isError) {
    return (
      <StateView status="error" error={account.error} onRetry={() => void account.refetch()} />
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
    <>
      <ListItem
        label={t('profile:settings.twoFactor')}
        detail={t(enabled ? 'profile:settings.twoFactorOn' : 'profile:settings.twoFactorOff')}
      />
      {error ? <Text tone="danger">{error}</Text> : null}
      {step.kind === 'idle' ? (
        <Button
          label={t(
            enabled ? 'profile:settings.twoFactorDisable' : 'profile:settings.twoFactorEnable',
          )}
          onPress={() => void start()}
          loading={generate.isPending}
          variant="secondary"
        />
      ) : (
        <>
          {step.kind === 'enabling' ? (
            <>
              <Text tone="muted">{t('profile:settings.twoFactorSecretHint')}</Text>
              <Text variant="subtitle" selectable>
                {step.secret}
              </Text>
            </>
          ) : null}
          <FormTextField
            control={form.control}
            name="code"
            label={t('profile:settings.twoFactorCode')}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />
          <Button
            label={t('profile:settings.twoFactorConfirm')}
            onPress={() => void confirm()}
            loading={enable.isPending || disable.isPending}
          />
          <Button label={t('common:actions.cancel')} onPress={reset} variant="ghost" />
        </>
      )}
    </>
  );
}
