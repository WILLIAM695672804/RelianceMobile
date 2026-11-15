import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Button,
  Chip,
  Icon,
  Screen,
  SectionHeader,
  Snackbar,
  StepIndicator,
  Text,
} from '@/shared/components';

import { useUpdateJobStatus } from '../hooks/useMissions';

/** Motifs proposés, repris de `CancelScreen` des maquettes. */
export const CANCEL_REASONS = ['unavailable', 'client', 'delay', 'other'] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

export interface CancelMissionScreenProps {
  jobId: string;
  onBack?: () => void;
  /** Appelé après l'annulation effective. */
  onDone: () => void;
}

/**
 * Annulation d'une mission, en deux temps comme la maquette : motif puis confirmation.
 * La maquette place l'annulation côté client ; `PATCH /jobs/{id}/status` n'accepte que le
 * technicien assigné, l'écran est donc le sien.
 */
export function CancelMissionScreen({ jobId, onBack, onDone }: CancelMissionScreenProps) {
  const { t } = useTranslation();
  const update = useUpdateJobStatus(jobId);
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<CancelReason>('unavailable');
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        status: 'cancelled',
        completionNotes: t(`missions:cancel.reasons.${reason}`),
      });
      onDone();
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  return (
    <Screen
      title={t('missions:cancel.title')}
      onBack={onBack}
      scroll
      footer={
        <View style={styles.footer}>
          <StepIndicator steps={2} current={step} testID="cancel-steps" />
          {error ? <Snackbar message={error} tone="danger" /> : null}
          <Button
            label={t(step === 0 ? 'missions:cancel.continue' : 'missions:cancel.confirm')}
            icon={step === 0 ? 'arrowR' : 'close'}
            variant="danger"
            size="lg"
            fullWidth
            onPress={() => (step === 0 ? setStep(1) : void confirm())}
            loading={update.isPending}
          />
        </View>
      }
    >
      {step === 0 ? (
        <>
          <Text tone="muted">{t('missions:cancel.hint')}</Text>
          <SectionHeader title={t('missions:cancel.reason')} />
          <View style={styles.reasons}>
            {CANCEL_REASONS.map((candidate) => (
              <Chip
                key={candidate}
                label={t(`missions:cancel.reasons.${candidate}`)}
                selected={candidate === reason}
                onPress={() => setReason(candidate)}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.warning}>
          <Icon name="info" size={40} tone="danger" />
          <Text variant="subtitle" accessibilityRole="header" style={styles.centered}>
            {t('missions:cancel.confirmTitle')}
          </Text>
          <Text tone="muted" style={styles.centered}>
            {t('missions:cancel.confirmMessage')}
          </Text>
          <Text tone="muted" style={styles.centered}>
            {t('missions:cancel.chosenReason', {
              reason: t(`missions:cancel.reasons.${reason}`),
            })}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  warning: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  centered: { textAlign: 'center' },
});
