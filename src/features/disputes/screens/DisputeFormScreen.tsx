import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Button,
  Chip,
  FormTextField,
  Screen,
  SectionHeader,
  Snackbar,
  Text,
} from '@/shared/components';

import { useOpenDispute } from '../hooks/useDisputes';
import {
  disputeFormSchema,
  DISPUTE_REASONS,
  type DisputeFormValues,
  type DisputeReason,
} from '../schemas/disputeSchemas';

export interface DisputeFormScreenProps {
  /** Demande contestée. */
  requestId: string;
  /** Partie mise en cause. */
  against: string;
  onBack?: () => void;
  /** Appelé avec l'identifiant du litige ouvert. */
  onOpened: (disputeId: string) => void;
}

/** Ouverture d'un litige : motif puis description, transposition de `DisputeScreen`. */
export function DisputeFormScreen({
  requestId,
  against,
  onBack,
  onOpened,
}: DisputeFormScreenProps) {
  const { t } = useTranslation();
  const open = useOpenDispute();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: { reason: 'quality', description: '' },
  });
  const reason = useWatch({ control: form.control, name: 'reason' });

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const dispute = await open.mutateAsync({
        requestId,
        against,
        reason: values.reason,
        description: values.description.trim(),
      });
      onOpened(dispute.id);
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  return (
    <Screen
      title={t('disputes:form.title')}
      onBack={onBack}
      scroll
      footer={
        <Button
          label={t('disputes:form.submit')}
          icon="shield"
          size="lg"
          fullWidth
          onPress={() => void submit()}
          loading={open.isPending}
        />
      }
    >
      <Text tone="muted">{t('disputes:form.hint')}</Text>
      <SectionHeader title={t('disputes:form.reason')} />
      <View style={styles.reasons}>
        {DISPUTE_REASONS.map((candidate: DisputeReason) => (
          <Chip
            key={candidate}
            label={t(`disputes:reasons.${candidate}`)}
            selected={candidate === reason}
            onPress={() => form.setValue('reason', candidate, { shouldValidate: true })}
          />
        ))}
      </View>
      <FormTextField
        control={form.control}
        name="description"
        label={t('disputes:form.description')}
        multiline
      />
      {error ? <Snackbar message={error} tone="danger" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
