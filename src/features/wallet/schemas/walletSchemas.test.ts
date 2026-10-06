import recharge from '@/test/fixtures/wallet/recharge.json';
import transactions from '@/test/fixtures/wallet/transactions.json';
import wallet from '@/test/fixtures/wallet/wallet.json';

import {
  paymentRequestSchema,
  rechargeFormSchema,
  toRechargePayload,
  toWithdrawalPayload,
  transactionPageSchema,
  walletResponseSchema,
  withdrawFormSchema,
} from './walletSchemas';

describe('walletSchemas', () => {
  it('lit le portefeuille', () => {
    const parsed = walletResponseSchema.parse(wallet).data;

    expect(parsed.balance).toBe(wallet.data.balance);
    expect(parsed.available_balance).toBe(wallet.data.available_balance);
    expect(parsed.currency).toBe('XAF');
    expect(parsed.held_amount).toBe(0);
  });

  it('lit l’historique des transactions', () => {
    const page = transactionPageSchema.parse(transactions);

    expect(page.data).toEqual([]);
    expect(page.meta?.total).toBe(0);
    expect(
      transactionPageSchema.parse({
        data: [
          {
            id: 't1',
            amount: '12000.00',
            balance_after: '12000.00',
            type: 'credit',
            meta: null,
            created_at: null,
          },
        ],
      }).data[0]?.amount,
    ).toBe(12000);
  });

  it('lit la réponse d’une demande de paiement, y compris refusée', () => {
    const parsed = paymentRequestSchema.parse(recharge);

    expect(parsed.message).toBe(recharge.message);
    expect(parsed.status).toBe('failed');
    expect(
      paymentRequestSchema.parse({ message: 'Paiement initié', status: 'pending' }).status,
    ).toBe('pending');
  });

  it('valide une recharge et exige le téléphone pour le mobile money', () => {
    const valid = { amount: '5000', method: 'momo', phone: '600000000' };
    expect(rechargeFormSchema.safeParse(valid).success).toBe(true);
    expect(rechargeFormSchema.safeParse({ ...valid, amount: '50' }).error?.issues[0]?.message).toBe(
      'wallet:forms.errors.amountTooSmall',
    );
    expect(rechargeFormSchema.safeParse({ ...valid, phone: '' }).error?.issues[0]?.message).toBe(
      'wallet:forms.errors.phoneRequired',
    );
    expect(
      rechargeFormSchema.safeParse({ ...valid, phone: '12345' }).error?.issues[0]?.message,
    ).toBe('wallet:forms.errors.phoneInvalid');
    expect(
      rechargeFormSchema.safeParse({ amount: '5000', method: 'card', phone: '' }).success,
    ).toBe(true);

    expect(toRechargePayload(valid)).toEqual({
      amount: 5000,
      method: 'momo',
      phoneNumber: '600000000',
    });
    expect(toRechargePayload({ amount: '5000', method: 'card', phone: '' }).phoneNumber).toBeNull();
  });

  it('valide un retrait avec son minimum propre', () => {
    const valid = { amount: '1000', method: 'om', phone: '690000000' };
    expect(withdrawFormSchema.safeParse(valid).success).toBe(true);
    expect(
      withdrawFormSchema.safeParse({ ...valid, amount: '400' }).error?.issues[0]?.message,
    ).toBe('wallet:forms.errors.withdrawalTooSmall');
    expect(toWithdrawalPayload(valid)).toEqual({
      amount: 1000,
      method: 'om',
      phoneNumber: '690000000',
    });
  });
});
