import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { View } from 'react-native';

import {
  Banner,
  Button,
  Card,
  ConfirmSheet,
  EmptyState,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';
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
  onBack?: () => void;
}

/** E17 — Devis d'une demande : rédaction et envoi (technicien), décision (client). */
export function RequestQuotesScreen({
  requestId,
  onOpenInvoices,
  onBack,
}: RequestQuotesScreenProps) {
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
    <Card key={quote.id} padding={0}>
      <ListRow
        icon="file"
        title={t('billing:quotes.total', { amount: formatAmount(quote.total_amount) })}
        detail={[
          quote.issuer ? t('billing:quotes.issuer', { name: quote.issuer.name }) : null,
          quote.created_at
            ? t('billing:quotes.createdAt', { date: formatDate(quote.created_at) })
            : null,
          quote.valid_until
            ? t('billing:quotes.validUntil', { date: formatDate(quote.valid_until) })
            : null,
        ]
          .filter(Boolean)
          .join('\n')}
        trailing={
          <Pill
            size="sm"
            label={t(`billing:quoteStatus.${quote.status}`)}
            tone={quoteToneOf(quote.status)}
          />
        }
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}>
        {quote.breakdown.length > 0 ? (
          <View style={{ gap: 2 }}>
            <Text variant="eyebrow" tone="muted">
              {t('billing:quotes.breakdown')}
            </Text>
            {quote.breakdown.map((line, index) => (
              <Text key={`${line.label}-${index}`} variant="label">
                {t('billing:quotes.line', { label: line.label, amount: formatAmount(line.amount) })}
              </Text>
            ))}
          </View>
        ) : null}
        {isTechnician && isQuoteSendable(quote.status) ? (
          <Button
            label={t('billing:quotes.send')}
            icon="send"
            full
            onPress={() => void send(quote)}
            loading={sendQuote.isPending}
          />
        ) : null}
        {!isTechnician && isQuoteDecidable(quote.status) ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('billing:quotes.reject')}
                variant="ghost"
                full
                onPress={() => setPending({ quote, decision: 'reject' })}
                disabled={busy}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                label={t('billing:quotes.accept')}
                full
                onPress={() => setPending({ quote, decision: 'accept' })}
                disabled={busy}
              />
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );

  const decision = pending?.decision ?? 'accept';

  return (
    <Screen
      testID="devis-demande"
      onRefresh={() => void quotes.refetch()}
      refreshing={quotes.isRefetching}
    >
      <TopBar title={t('billing:quotes.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        {accepted && onOpenInvoices ? (
          <Button
            label={t('billing:quotes.openInvoices')}
            icon="file"
            variant="soft"
            full
            onPress={onOpenInvoices}
          />
        ) : null}
        <QueryGate queries={[quotes]}>
          {() =>
            (quotes.data ?? []).length === 0 ? (
              <EmptyState
                icon="file"
                title={t('billing:quotes.title')}
                message={t(isTechnician ? 'billing:quotes.empty' : 'billing:quotes.emptyClient')}
              />
            ) : (
              <>{quotes.data!.map(renderQuote)}</>
            )
          }
        </QueryGate>
      </View>
      {isTechnician ? (
        <Section>
          <View style={{ paddingHorizontal: 20 }}>
            <QuoteEditorCard requestId={requestId} />
          </View>
        </Section>
      ) : null}
      <ConfirmSheet
        visible={pending !== null}
        destructive={decision === 'reject'}
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
