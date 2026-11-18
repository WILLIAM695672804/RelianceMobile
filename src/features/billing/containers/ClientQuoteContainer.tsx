import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { useRequest } from '@/features/requests';
import { formatDate } from '@/shared/format';
import type { LineItem } from '@/shared/model';
import { BackButton, EmptyState, QueryGate, Screen, useToast } from '@/shared/ui';

import { useAcceptQuote, useRejectQuote, useRequestQuotes } from '../hooks/useBilling';
import { isQuoteDecidable } from '../model/quoteStatus';
import type { Quote } from '../schemas/billingSchemas';
import { QuoteView, type QuoteDocument } from '../ui/QuoteView';

/**
 * Lignes du devis : la ventilation du serveur, complétée d'une ligne d'écart si elle ne couvre
 * pas le total (ou d'une ligne forfaitaire si elle est absente). Le total affiché est donc
 * toujours celui que le client engage.
 */
export function quoteLines(quote: Quote, labels: { flat: string; other: string }): LineItem[] {
  const lines: LineItem[] = quote.breakdown.map((line) => ({
    label: line.label,
    quantity: 1,
    unitPrice: line.amount,
  }));
  const covered = lines.reduce((sum, line) => sum + line.unitPrice, 0);
  const gap = quote.total_amount - covered;
  if (gap > 0) {
    lines.push({
      label: lines.length === 0 ? labels.flat : labels.other,
      quantity: 1,
      unitPrice: gap,
    });
  }
  return lines;
}

/** Devis à trancher : le plus récent des devis envoyés. */
export function pendingQuote(quotes: readonly Quote[]): Quote | null {
  return (
    [...quotes]
      .filter((quote) => isQuoteDecidable(quote.status))
      .sort((left, right) => (right.created_at ?? '').localeCompare(left.created_at ?? ''))[0] ??
    null
  );
}

export interface ClientQuoteContainerProps {
  requestId: string;
  onBack: () => void;
  /** Devis accepté : la facture est émise et le séquestre bloqué. */
  onAccepted: () => void;
}

/** Devis formel du client : acceptation (séquestre bloqué) ou refus. */
export function ClientQuoteContainer({ requestId, onBack, onAccepted }: ClientQuoteContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const clientName = useSession((state) => state.user?.name ?? '');
  const quotes = useRequestQuotes(requestId);
  const request = useRequest(requestId);
  const accept = useAcceptQuote();
  const reject = useRejectQuote();
  const [submitting, setSubmitting] = useState<'accept' | 'reject' | null>(null);

  const decide = async (quote: Quote, decision: 'accept' | 'reject') => {
    setSubmitting(decision);
    try {
      if (decision === 'accept') {
        await accept.mutateAsync(quote.id);
        toast.show({ kind: 'success', title: t('billing:quotes.acceptedFallback') });
        onAccepted();
      } else {
        await reject.mutateAsync(quote.id);
        toast.show({ kind: 'info', title: t('billing:quotes.rejected') });
        onBack();
      }
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <QueryGate queries={[quotes]}>
      {() => {
        const quote = pendingQuote(quotes.data ?? []);
        if (!quote) {
          return (
            <Screen testID="devis-vide">
              <BackButton onPress={onBack} />
              <EmptyState
                icon="file"
                title={t('billing:quoteView.noneTitle')}
                message={t('billing:quotes.emptyClient')}
              />
            </Screen>
          );
        }
        const address = request.data?.address;
        const document: QuoteDocument = {
          reference: `#${quote.id.slice(0, 8).toUpperCase()}`,
          validUntil: quote.valid_until ? formatDate(quote.valid_until) : null,
          issuer: { name: quote.issuer?.name ?? '', role: t('billing:quoteView.issuerRole') },
          recipient: {
            name: clientName,
            place: [address?.address, address?.city].filter(Boolean).join(', '),
          },
          lines: quoteLines(quote, {
            flat: request.data?.title ?? t('billing:quoteView.flat'),
            other: t('billing:quoteView.other'),
          }),
          feeRate: 0,
          conditions: [t('billing:quoteView.escrowCondition')],
        };
        return (
          <QuoteView
            quote={document}
            submitting={submitting}
            onBack={onBack}
            onAccept={() => void decide(quote, 'accept')}
            onReject={() => void decide(quote, 'reject')}
          />
        );
      }}
    </QueryGate>
  );
}
