import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import { Banner, Button, EmptyState, Screen, Text, TopBar } from '@/shared/ui';

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

  if (sent) {
    return (
      <Screen testID="demande-technicien">
        <TopBar title={t('profile:upgrade.title')} onBack={onDone} />
        <EmptyState
          icon="check"
          title={t('profile:upgrade.title')}
          message={t('profile:upgrade.sent')}
          actionLabel={t('common:actions.back')}
          onAction={onDone}
        />
      </Screen>
    );
  }

  return (
    <Screen
      testID="demande-technicien"
      footer={
        <Button
          label={t('profile:upgrade.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={requestUpgrade.isPending}
        />
      }
    >
      <TopBar title={t('profile:upgrade.title')} onBack={onDone} />
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Text variant="label" tone="muted">
          {t('profile:upgrade.hint')}
        </Text>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        <FormField
          control={form.control}
          name="motivation"
          label={t('profile:upgrade.motivation')}
          multiline
        />
        <FormField control={form.control} name="bio" label={t('profile:upgrade.bio')} multiline />
      </View>
    </Screen>
  );
}
