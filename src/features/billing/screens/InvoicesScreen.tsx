import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useInvoices } from '../hooks/useBilling';
import { invoiceToneOf } from '../model/quoteStatus';

export interface InvoicesScreenProps {
  /** Ouverture du détail d'une facture. */
  onOpen: (invoiceId: string) => void;
}

/** E22 — Factures reçues et émises. */
export function InvoicesScreen({ onOpen }: InvoicesScreenProps) {
  const { t } = useTranslation();
  const invoices = useInvoices();

  const renderInvoices = () => {
    if (invoices.isPending) return <StateView status="loading" />;
    if (invoices.isError) {
      return (
        <StateView status="error" error={invoices.error} onRetry={() => void invoices.refetch()} />
      );
    }
    if (invoices.data.invoices.length === 0) {
      return <StateView status="empty" message={t('billing:invoices.empty')} />;
    }
    return invoices.data.invoices.map((entry) => (
      <Card key={entry.id}>
        <Text variant="subtitle">
          {entry.reference
            ? t('billing:invoices.reference', { reference: entry.reference })
            : t('billing:invoices.noReference')}
        </Text>
        <Badge
          label={t(`billing:invoiceStatus.${entry.status}`)}
          tone={invoiceToneOf(entry.status)}
        />
        <Text>{t('billing:invoices.amount', { amount: formatAmount(entry.amount) })}</Text>
        {entry.created_at ? (
          <Text tone="muted">
            {t('billing:invoices.issuedAt', { date: formatDate(entry.created_at) })}
          </Text>
        ) : null}
        <Button
          label={t('billing:invoices.open')}
          onPress={() => onOpen(entry.id)}
          variant="secondary"
        />
      </Card>
    ));
  };

  return (
    <Screen
      title={t('billing:invoices.title')}
      onRefresh={() => void invoices.refetch()}
      refreshing={invoices.isRefetching}
    >
      {renderInvoices()}
    </Screen>
  );
}
