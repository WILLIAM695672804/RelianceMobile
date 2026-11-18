import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/core/theme';

import { describeError, normalizeError } from '@/core/errors';
import {
  Banner,
  Button,
  Card,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  Text,
  TopBar,
  type PillTone,
} from '@/shared/ui';
import { formatAmount, formatDate } from '@/shared/format';

import { useConfirmPayment, usePayment } from '../hooks/usePayments';
import { isPaymentPending, type PaymentStatus } from '../schemas/paymentSchemas';

const TONE_BY_STATUS: Record<PaymentStatus, PillTone> = {
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
  const theme = useTheme();
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
      testID="confirmation-paiement"
      onRefresh={() => void payment.refetch()}
      refreshing={payment.isRefetching}
      footer={
        <View style={{ gap: 10 }}>
          {error ? <Banner tone="danger" message={error} /> : null}
          {settled ? <Banner tone="success" message={t('wallet:payment.settled')} /> : null}
          {pending && !settled ? (
            <Button
              label={t('wallet:payment.confirm')}
              icon="check"
              size="lg"
              full
              onPress={() => void validate()}
              loading={confirm.isPending}
            />
          ) : (
            <Button label={t('wallet:payment.done')} size="lg" full onPress={onDone} />
          )}
        </View>
      }
    >
      <TopBar title={t('wallet:payment.title')} onBack={onBack ?? onDone} />
      <QueryGate queries={[payment]}>
        {() => {
          const data = payment.data!;
          const status = settled ? 'settled' : data.status;
          return (
            <View style={{ paddingHorizontal: 20, gap: 14 }}>
              <Card padding={20}>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <Pill
                    label={t(`wallet:payment.statuses.${status}`)}
                    tone={TONE_BY_STATUS[status]}
                  />
                  <Text
                    variant="display"
                    style={{ fontFamily: theme.fontFamily.display }}
                    align="center"
                  >
                    {formatAmount(data.amount)}
                  </Text>
                </View>
              </Card>
              <Card padding={0}>
                {data.method ? (
                  <ListRow
                    icon="wallet"
                    title={t('wallet:payment.method', {
                      method: t(`wallet:methods.${data.method}`, { defaultValue: data.method }),
                    })}
                  />
                ) : null}
                {data.external_ref ? (
                  <ListRow
                    icon="file"
                    divider={Boolean(data.method)}
                    title={t('wallet:payment.reference', { reference: data.external_ref })}
                  />
                ) : null}
                {data.created_at ? (
                  <ListRow
                    icon="calendar"
                    divider
                    title={t('wallet:payment.createdAt', { date: formatDate(data.created_at) })}
                  />
                ) : null}
              </Card>
              <Text variant="label" tone="muted">
                {t(pending && !settled ? 'wallet:payment.hint' : 'wallet:payment.doneHint')}
              </Text>
            </View>
          );
        }}
      </QueryGate>
    </Screen>
  );
}
