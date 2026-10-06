import invoicePaid from '@/test/fixtures/billing/invoice-paid.json';
import invoice from '@/test/fixtures/billing/invoice.json';
import invoices from '@/test/fixtures/billing/invoices.json';
import quoteAccepted from '@/test/fixtures/billing/quote-accepted.json';
import quoteCreated from '@/test/fixtures/billing/quote-created.json';
import quote from '@/test/fixtures/billing/quote.json';
import quotes from '@/test/fixtures/billing/quotes.json';

import {
  invoicePageSchema,
  invoiceResponseSchema,
  quoteAcceptedResponseSchema,
  quoteFormSchema,
  quoteLineFormSchema,
  quoteListResponseSchema,
  quoteResponseSchema,
  toQuoteLine,
  toQuotePayload,
} from './billingSchemas';

describe('billingSchemas', () => {
  it('lit un devis créé et son détail chiffré', () => {
    const created = quoteResponseSchema.parse(quoteCreated).data;

    expect(created.status).toBe('draft');
    expect(created.total_amount).toBe(18000);
    expect(created.breakdown).toHaveLength(2);
    expect(created.breakdown[0]?.amount).toBe(12000);
    expect(created.valid_until).toBe(quoteCreated.data.valid_until);
  });

  it('lit un devis sans détail et la liste des devis d’une demande', () => {
    const list = quoteListResponseSchema.parse(quotes).data;

    expect(list).toHaveLength(quotes.data.length);
    expect(list.some((entry) => entry.breakdown.length === 0)).toBe(true);
    expect(quoteResponseSchema.parse(quote).data.issuer?.name).toBe(quote.data.issuer.name);
  });

  it('lit l’acceptation d’un devis et la facture produite', () => {
    const accepted = quoteAcceptedResponseSchema.parse(quoteAccepted);

    expect(accepted.message).toBe(quoteAccepted.message);
    expect(accepted.data.quote.status).toBe('accepted');
    expect(accepted.data.invoice_id).toBe(quoteAccepted.data.invoice_id);
  });

  it('lit les factures et leurs montants', () => {
    const page = invoicePageSchema.parse(invoices);
    expect(page.data).toHaveLength(invoices.data.length);
    expect(page.meta?.total).toBe(invoices.meta.total);

    const detail = invoiceResponseSchema.parse(invoice).data;
    expect(detail.amount).toBe(18000);
    expect(detail.tax_amount).toBe(0);
    expect(detail.reference).toBe(invoice.data.reference);
    expect(detail.client?.name).toBe(invoice.data.client.name);
    expect(invoiceResponseSchema.parse(invoicePaid).data.status).toBe('paid');
  });

  it('valide une ligne de détail', () => {
    expect(quoteLineFormSchema.safeParse({ label: 'Main d’œuvre', amount: '12000' }).success).toBe(
      true,
    );
    expect(
      quoteLineFormSchema.safeParse({ label: ' ', amount: '12000' }).error?.issues[0]?.message,
    ).toBe('billing:editor.errors.labelRequired');
    expect(
      quoteLineFormSchema.safeParse({ label: 'Pièces', amount: '12 000' }).error?.issues[0]
        ?.message,
    ).toBe('billing:editor.errors.amountInvalid');
    expect(toQuoteLine({ label: ' Pièces ', amount: '6000' })).toEqual({
      label: 'Pièces',
      amount: 6000,
    });
  });

  it('valide le devis et construit sa charge utile', () => {
    expect(quoteFormSchema.safeParse({ totalAmount: '18000', validityDays: '7' }).success).toBe(
      true,
    );
    expect(
      quoteFormSchema.safeParse({ totalAmount: '0', validityDays: '7' }).error?.issues[0]?.message,
    ).toBe('billing:editor.errors.totalInvalid');
    expect(
      quoteFormSchema.safeParse({ totalAmount: '18000', validityDays: '120' }).error?.issues[0]
        ?.message,
    ).toBe('billing:editor.errors.validityTooLong');

    const payload = toQuotePayload(
      'r1',
      { totalAmount: '18000', validityDays: '7' },
      [{ label: 'Main d’œuvre', amount: 12000 }],
      new Date(Date.UTC(2026, 9, 6)),
    );
    expect(payload).toEqual({
      requestId: 'r1',
      totalAmount: 18000,
      breakdown: [{ label: 'Main d’œuvre', amount: 12000 }],
      validUntil: '2026-10-13',
    });
    expect(
      toQuotePayload(
        'r1',
        { totalAmount: '9000', validityDays: '1' },
        [],
        new Date(Date.UTC(2026, 11, 31)),
      ).breakdown,
    ).toBeNull();
    expect(
      toQuotePayload(
        'r1',
        { totalAmount: '9000', validityDays: '1' },
        [],
        new Date(Date.UTC(2026, 11, 31)),
      ).validUntil,
    ).toBe('2027-01-01');
  });
});
