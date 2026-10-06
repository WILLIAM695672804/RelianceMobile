import {
  invoiceToneOf,
  isQuoteDecidable,
  isQuoteSendable,
  QUOTE_STATUSES,
  quoteToneOf,
  sumLines,
} from './quoteStatus';

describe('modèle des devis', () => {
  it('énumère les statuts et leur ton', () => {
    expect(QUOTE_STATUSES).toEqual(['draft', 'sent', 'accepted', 'rejected', 'expired']);
    expect(quoteToneOf('accepted')).toBe('success');
    expect(quoteToneOf('rejected')).toBe('danger');
    expect(quoteToneOf('inconnu')).toBe('neutral');
    expect(invoiceToneOf('paid')).toBe('success');
    expect(invoiceToneOf('unpaid')).toBe('warning');
  });

  it('distingue les devis envoyables et décidables', () => {
    expect(isQuoteSendable('draft')).toBe(true);
    expect(isQuoteSendable('sent')).toBe(false);
    expect(isQuoteDecidable('sent')).toBe(true);
    expect(isQuoteDecidable('draft')).toBe(false);
    expect(isQuoteDecidable('accepted')).toBe(false);
  });

  it('somme les lignes de détail', () => {
    expect(sumLines([])).toBe(0);
    expect(
      sumLines([
        { label: 'A', amount: 12000 },
        { label: 'B', amount: 6000 },
      ]),
    ).toBe(18000);
  });
});
