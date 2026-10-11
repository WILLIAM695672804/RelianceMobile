import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { useRequestUpgrade } from '../hooks/useProfileMutations';
import { toUpgradePayload, upgradeFormSchema } from '../schemas/profileSchemas';

export interface UpgradeRequestScreenProps {
  /** Retour au profil. */
  onDone: () => void;
}

/** Demande de passage au rôle technicien (client uniquement). */
export function UpgradeRequestScreen({ onDone }: UpgradeRequestScreenProps) {
  const { t } = useTranslation();
  const requestUpgrade = useRequestUpgrade();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(upgradeFormSchema),
    defaultValues: { motivation: '', bio: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await requestUpgrade.mutateAsync(toUpgradePayload(values));
      setSent(true);
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen title={t('profile:upgrade.title')} scroll>
      {sent ? (
        <>
          <Text tone="primary">{t('profile:upgrade.sent')}</Text>
          <Button label={t('common:actions.back')} onPress={onDone} variant="secondary" />
        </>
      ) : (
        <>
          <Text tone="muted">{t('profile:upgrade.hint')}</Text>
          {formError ? <Text tone="danger">{formError}</Text> : null}
          <FormTextField
            control={form.control}
            name="motivation"
            label={t('profile:upgrade.motivation')}
            multiline
          />
          <FormTextField
            control={form.control}
            name="bio"
            label={t('profile:upgrade.bio')}
            multiline
          />
          <Button
            label={t('profile:upgrade.submit')}
            onPress={() => void onSubmit()}
            loading={requestUpgrade.isPending}
          />
        </>
      )}
    </Screen>
  );
}
