import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { Badge, Button, Card, ConfirmDialog, Screen, StateView, Text } from '@/shared/components';
import { formatAmount, formatDate } from '@/shared/format';

import {
  useAcceptQuote,
  useRejectQuote,
  useRequestQuotes,
  useSendQuote,
} from '../hooks/useBilling';
import { isQuoteDecidable, isQuoteSendable, quoteToneOf } from '../model/quoteStatus';
import type { Quote } from '../schemas/billingSchemas';
import { QuoteEditorCard } from './QuoteEditorCard';

type Decision = 'accept' | 'reject';

export interface RequestQuotesScreenProps {
  requestId: string;
  /** Ouverture de la liste des factures, après acceptation. */
  onOpenInvoices?: () => void;
}

/** E17 — Devis d'une demande : rédaction et envoi (technicien), décision (client). */
export function RequestQuotesScreen({ requestId, onOpenInvoices }: RequestQuotesScreenProps) {
  const { t } = useTranslation();
  const role = useSession((state) => state.user?.role);
  const isTechnician = role === 'technicien';
  const quotes = useRequestQuotes(requestId);
  const sendQuote = useSendQuote();
  const acceptQuote = useAcceptQuote();
  const rejectQuote = useRejectQuote();
  const [pending, setPending] = useState<{ quote: Quote; decision: Decision } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const reset = () => {
    setNotice(null);
    setError(null);
  };

  const send = async (quote: Quote) => {
    reset();
    try {
      await sendQuote.mutateAsync(quote.id);
      setNotice(t('billing:quotes.sent'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const decide = async () => {
    const target = pending;
    setPending(null);
    if (!target) return;
    reset();
    try {
      if (target.decision === 'accept') {
        const acceptance = await acceptQuote.mutateAsync(target.quote.id);
        setAccepted(true);
        setNotice(
          acceptance.invoiceId
            ? t('billing:quotes.accepted', { reference: acceptance.invoiceId })
            : t('billing:quotes.acceptedFallback'),
        );
      } else {
        await rejectQuote.mutateAsync(target.quote.id);
        setNotice(t('billing:quotes.rejected'));
      }
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const busy = sendQuote.isPending || acceptQuote.isPending || rejectQuote.isPending;

  const renderQuote = (quote: Quote) => (
    <Card key={quote.id}>
      <Text variant="subtitle">
        {t('billing:quotes.total', { amount: formatAmount(quote.total_amount) })}
      </Text>
      <Badge label={t(`billing:quoteStatus.${quote.status}`)} tone={quoteToneOf(quote.status)} />
      {quote.issuer ? (
        <Text tone="muted">{t('billing:quotes.issuer', { name: quote.issuer.name })}</Text>
      ) : null}
      {quote.created_at ? (
        <Text tone="muted">
          {t('billing:quotes.createdAt', { date: formatDate(quote.created_at) })}
        </Text>
      ) : null}
      {quote.valid_until ? (
        <Text tone="muted">
          {t('billing:quotes.validUntil', { date: formatDate(quote.valid_until) })}
        </Text>
      ) : null}
      {quote.breakdown.length > 0 ? (
        <>
          <Text variant="caption" tone="muted">
            {t('billing:quotes.breakdown')}
          </Text>
          {quote.breakdown.map((line, index) => (
            <Text key={`${line.label}-${index}`}>
              {t('billing:quotes.line', { label: line.label, amount: formatAmount(line.amount) })}
            </Text>
          ))}
        </>
      ) : null}
      {isTechnician && isQuoteSendable(quote.status) ? (
        <Button
          label={t('billing:quotes.send')}
          onPress={() => void send(quote)}
          loading={sendQuote.isPending}
        />
      ) : null}
      {!isTechnician && isQuoteDecidable(quote.status) ? (
        <>
          <Button
            label={t('billing:quotes.accept')}
            onPress={() => setPending({ quote, decision: 'accept' })}
            disabled={busy}
          />
          <Button
            label={t('billing:quotes.reject')}
            onPress={() => setPending({ quote, decision: 'reject' })}
            disabled={busy}
            variant="ghost"
          />
        </>
      ) : null}
    </Card>
  );

  const renderQuotes = () => {
    if (quotes.isPending) return <StateView status="loading" />;
    if (quotes.isError) {
      return (
        <StateView status="error" error={quotes.error} onRetry={() => void quotes.refetch()} />
      );
    }
    if (quotes.data.length === 0) {
      return (
        <StateView
          status="empty"
          message={t(isTechnician ? 'billing:quotes.empty' : 'billing:quotes.emptyClient')}
        />
      );
    }
    return quotes.data.map(renderQuote);
  };

  const decision = pending?.decision ?? 'accept';

  return (
    <Screen scroll onRefresh={() => void quotes.refetch()} refreshing={quotes.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('billing:quotes.title')}
      </Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {accepted && onOpenInvoices ? (
        <Button
          label={t('billing:quotes.openInvoices')}
          onPress={onOpenInvoices}
          variant="secondary"
        />
      ) : null}
      {renderQuotes()}
      {isTechnician ? <QuoteEditorCard requestId={requestId} /> : null}
      <ConfirmDialog
        visible={pending !== null}
        title={t(`billing:quotes.${decision}Title`)}
        message={t(`billing:quotes.${decision}Message`, {
          amount: formatAmount(pending?.quote.total_amount ?? 0),
        })}
        confirmLabel={t(
          decision === 'accept' ? 'billing:quotes.confirmAccept' : 'billing:quotes.confirmReject',
        )}
        onConfirm={() => void decide()}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}
