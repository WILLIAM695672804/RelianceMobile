import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { formatAmount, formatDate } from '@/shared/format';
import type { LineItem } from '@/shared/model';
import { QueryGate, useToast } from '@/shared/ui';

import { useInvoice, usePayInvoice, useQuote } from '../hooks/useBilling';
import type { Invoice, Quote } from '../schemas/billingSchemas';
import { InvoiceView, type InvoiceDocument } from '../ui/InvoiceView';
import { quoteLines } from './ClientQuoteContainer';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Facture du serveur au format document. Le montant est toutes taxes comprises : les lignes
 * reprennent la ventilation du devis d'origine, à défaut une prestation unique, et la taxe
 * éventuelle est rappelée en pied de page (comme sur le PDF du serveur).
 */
export function toInvoiceDocument(
  invoice: Invoice,
  quote: Quote | null,
  t: Translate,
): InvoiceDocument {
  const flat = t('billing:invoiceView.service');
  const lines: LineItem[] = quote
    ? quoteLines(
        { ...quote, total_amount: invoice.amount },
        { flat, other: t('billing:quoteView.other') },
      )
    : [{ label: flat, quantity: 1, unitPrice: invoice.amount }];
  const tax = invoice.tax_amount ?? 0;
  return {
    number: invoice.reference ?? `#${invoice.id.slice(0, 8).toUpperCase()}`,
    status: invoice.status === 'paid' ? 'paid' : 'pending',
    issuedOn: invoice.created_at ? formatDate(invoice.created_at) : '',
    issuer: { name: invoice.issuer?.name ?? '', lines: [] },
    recipient: { name: invoice.client?.name ?? '', lines: [] },
    lines,
    feeRate: 0,
    footer: tax > 0 ? [t('billing:invoiceView.taxIncluded', { amount: formatAmount(tax) })] : [],
  };
}

export interface InvoiceContainerProps {
  invoiceId: string;
  onBack: () => void;
}

/** Facture : consultation, partage du résumé et, côté client, déclaration du paiement. */
export function InvoiceContainer({ invoiceId, onBack }: InvoiceContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const role = useSession((state) => state.user?.role ?? null);
  const invoice = useInvoice(invoiceId);
  const quoteId = invoice.data?.quote_id ?? null;
  const quote = useQuote(quoteId ?? '');
  const pay = usePayInvoice();

  const declare = async (current: Invoice) => {
    try {
      await pay.mutateAsync(current.id);
      toast.show({ kind: 'success', title: t('billing:invoices.paid') });
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    }
  };

  return (
    <QueryGate queries={[invoice]}>
      {() => {
        const current = invoice.data!;
        const document = toInvoiceDocument(current, quoteId ? (quote.data ?? null) : null, t);
        return (
          <InvoiceView
            invoice={document}
            onBack={onBack}
            onPay={
              role === 'client' && current.status === 'unpaid'
                ? () => void declare(current)
                : undefined
            }
            paying={pay.isPending}
            onShare={() =>
              void Share.share({
                message: t('billing:invoiceView.shareMessage', {
                  number: document.number,
                  amount: formatAmount(current.amount),
                  date: document.issuedOn,
                }),
              })
            }
          />
        );
      }}
    </QueryGate>
  );
}
