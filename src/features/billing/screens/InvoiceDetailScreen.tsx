import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { Badge, Button, Card, ConfirmDialog, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import { useInvoice, usePayInvoice } from '../hooks/useBilling';
import { invoiceToneOf } from '../model/quoteStatus';
import type { Invoice } from '../schemas/billingSchemas';

export interface InvoiceDetailScreenProps {
  invoiceId: string;
}

/** Détail d'une facture ; le client peut déclarer son paiement. */
export function InvoiceDetailScreen({ invoiceId }: InvoiceDetailScreenProps) {
  const { t } = useTranslation();
  const invoice = useInvoice(invoiceId);

  const renderContent = () => {
    if (invoice.isPending) return <StateView status="loading" />;
    if (invoice.isError) {
      return (
        <StateView status="error" error={invoice.error} onRetry={() => void invoice.refetch()} />
      );
    }
    return <InvoiceDetail invoice={invoice.data} />;
  };

  return (
    <Screen
      title={t('billing:invoices.detailTitle')}
      scroll
      onRefresh={() => void invoice.refetch()}
      refreshing={invoice.isRefetching}
    >
      {renderContent()}
    </Screen>
  );
}

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation();
  const role = useSession((state) => state.user?.role);
  const payInvoice = usePayInvoice();
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const payable = role === 'client' && invoice.status === 'unpaid';

  const pay = async () => {
    setConfirming(false);
    setNotice(null);
    setError(null);
    try {
      await payInvoice.mutateAsync(invoice.id);
      setNotice(t('billing:invoices.paid'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  return (
    <>
      <Card>
        <Text variant="subtitle">
          {invoice.reference
            ? t('billing:invoices.reference', { reference: invoice.reference })
            : t('billing:invoices.noReference')}
        </Text>
        <Badge
          label={t(`billing:invoiceStatus.${invoice.status}`)}
          tone={invoiceToneOf(invoice.status)}
        />
        <Text>{t('billing:invoices.amount', { amount: formatAmount(invoice.amount) })}</Text>
        {invoice.tax_amount != null ? (
          <Text tone="muted">
            {t('billing:invoices.tax', { amount: formatAmount(invoice.tax_amount) })}
          </Text>
        ) : null}
        {invoice.issuer ? (
          <Text>{t('billing:invoices.issuer', { name: invoice.issuer.name })}</Text>
        ) : null}
        {invoice.client ? (
          <Text>{t('billing:invoices.client', { name: invoice.client.name })}</Text>
        ) : null}
        {invoice.created_at ? (
          <Text tone="muted">
            {t('billing:invoices.issuedAt', { date: formatDate(invoice.created_at) })}
          </Text>
        ) : null}
      </Card>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {payable ? (
        <Button
          label={t('billing:invoices.pay')}
          onPress={() => setConfirming(true)}
          loading={payInvoice.isPending}
        />
      ) : null}
      <ConfirmDialog
        visible={confirming}
        title={t('billing:invoices.payTitle')}
        message={t('billing:invoices.payMessage', { amount: formatAmount(invoice.amount) })}
        onConfirm={() => void pay()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
