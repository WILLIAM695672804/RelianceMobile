import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Badge,
  Button,
  Card,
  ListItem,
  Screen,
  Snackbar,
  StateView,
  Text,
  type BadgeTone,
} from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useConfirmPayment, usePayment } from '../hooks/usePayments';
import { isPaymentPending, type PaymentStatus } from '../schemas/paymentSchemas';

const TONE_BY_STATUS: Record<PaymentStatus, BadgeTone> = {
  pending: 'warning',
  settled: 'success',
  failed: 'danger',
  refunded: 'neutral',
};

export interface PaymentConfirmationScreenProps {
  paymentId: string;
  onBack?: () => void;
  /** Retour au portefeuille, une fois le paiement réglé. */
  onDone: () => void;
}

/**
 * Confirmation d'un paiement en attente. La maquette `WalletOTPScreen` demande un code à six
 * chiffres ; l'API n'en vérifie aucun, la validation se faisant auprès de l'opérateur sur le
 * téléphone. Aucun champ ne feint donc une vérification : l'écran rappelle la référence et
 * attend la confirmation.
 */
export function PaymentConfirmationScreen({
  paymentId,
  onBack,
  onDone,
}: PaymentConfirmationScreenProps) {
  const { t } = useTranslation();
  const payment = usePayment(paymentId);
  const confirm = useConfirmPayment(paymentId);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const validate = async () => {
    setError(null);
    try {
      await confirm.mutateAsync();
      setSettled(true);
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const pending = payment.data ? isPaymentPending(payment.data.status) : false;

  return (
    <Screen
      title={t('wallet:payment.title')}
      onBack={onBack}
      onRefresh={() => void payment.refetch()}
      refreshing={payment.isRefetching}
      footer={
        <View style={styles.footer}>
          {error ? <Snackbar message={error} tone="danger" /> : null}
          {settled ? <Snackbar message={t('wallet:payment.settled')} tone="success" /> : null}
          {pending && !settled ? (
            <Button
              label={t('wallet:payment.confirm')}
              icon="check"
              size="lg"
              fullWidth
              onPress={() => void validate()}
              loading={confirm.isPending}
            />
          ) : (
            <Button label={t('wallet:payment.done')} size="lg" fullWidth onPress={onDone} />
          )}
        </View>
      }
    >
      {payment.isPending ? <StateView status="loading" /> : null}
      {payment.isError ? (
        <StateView status="error" error={payment.error} onRetry={() => void payment.refetch()} />
      ) : null}
      {payment.isSuccess ? (
        <Card>
          <Badge
            label={t(`wallet:payment.statuses.${settled ? 'settled' : payment.data.status}`)}
            tone={TONE_BY_STATUS[settled ? 'settled' : payment.data.status]}
          />
          <Text variant="display">{formatAmount(payment.data.amount)}</Text>
          {payment.data.method ? (
            <ListItem
              label={t('wallet:payment.method', {
                method: t(`wallet:methods.${payment.data.method}`, {
                  defaultValue: payment.data.method,
                }),
              })}
              icon="wallet"
            />
          ) : null}
          {payment.data.external_ref ? (
            <ListItem
              label={t('wallet:payment.reference', { reference: payment.data.external_ref })}
              icon="file"
            />
          ) : null}
          {payment.data.created_at ? (
            <ListItem
              label={t('wallet:payment.createdAt', {
                date: formatDate(payment.data.created_at),
              })}
              icon="calendar"
            />
          ) : null}
          <Text tone="muted">
            {t(pending && !settled ? 'wallet:payment.hint' : 'wallet:payment.doneHint')}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10 },
});
