import { isMobileMethod, PAYMENT_METHODS, transactionToneOf } from './transaction';

describe('modèle des transactions', () => {
  it('énumère les moyens de paiement et distingue le mobile money', () => {
    expect(PAYMENT_METHODS).toEqual(['momo', 'om', 'card', 'bank_transfer']);
    expect(isMobileMethod('momo')).toBe(true);
    expect(isMobileMethod('om')).toBe(true);
    expect(isMobileMethod('card')).toBe(false);
  });

  it('donne un ton par type de transaction', () => {
    expect(transactionToneOf('credit')).toBe('success');
    expect(transactionToneOf('debit')).toBe('danger');
    expect(transactionToneOf('hold')).toBe('warning');
    expect(transactionToneOf('inconnu')).toBe('neutral');
  });
});
