import { z } from 'zod';

import { decimalSchema } from '@/core/api';

import { isMobileMethod, PAYMENT_METHODS } from '../model/transaction';

/** Portefeuille (`WalletResource`). */
export const walletSchema = z.object({
  id: z.string(),
  balance: decimalSchema,
  available_balance: decimalSchema,
  held_amount: decimalSchema.nullish(),
  currency: z.string().nullish(),
  updated_at: z.string().nullish(),
});
export type Wallet = z.infer<typeof walletSchema>;

export const walletResponseSchema = z.object({ data: walletSchema });

/** Mouvement du portefeuille (`TransactionResource`). */
export const transactionSchema = z.object({
  id: z.string(),
  amount: decimalSchema,
  balance_after: decimalSchema.nullish(),
  type: z.string(),
  meta: z.record(z.string(), z.unknown()).nullish(),
  created_at: z.string().nullish(),
});
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionPageSchema = z.object({
  data: z.array(transactionSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/**
 * Réponse d'une demande de paiement (recharge ou retrait). Un refus de la passerelle
 * emprunte le même corps, avec `status: "failed"` et un code HTTP 422.
 */
export const paymentRequestSchema = z.object({
  message: z.string(),
  payment_id: z.string().nullish(),
  external_ref: z.string().nullish(),
  status: z.string().nullish(),
});
export type PaymentRequestResult = z.infer<typeof paymentRequestSchema>;

export const RECHARGE_MIN_AMOUNT = 100;
export const WITHDRAWAL_MIN_AMOUNT = 500;
/** Numéro camerounais : neuf chiffres commençant par 6. */
const PHONE_PATTERN = /^6\d{8}$/;

const methodSchema = z.enum(PAYMENT_METHODS);

const amountSchema = (minimum: number, tooSmall: string) =>
  z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'wallet:forms.errors.amountInvalid')
    .refine((value): boolean => Number(value) >= minimum, tooSmall);

/** Le téléphone n'est exigé que pour le mobile money. */
const checkPhone = (values: { method: string; phone: string }, context: z.RefinementCtx): void => {
  if (!isMobileMethod(values.method)) return;
  const phone = values.phone.trim();
  if (phone.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['phone'],
      message: 'wallet:forms.errors.phoneRequired',
    });
    return;
  }
  if (!PHONE_PATTERN.test(phone)) {
    context.addIssue({
      code: 'custom',
      path: ['phone'],
      message: 'wallet:forms.errors.phoneInvalid',
    });
  }
};

export const rechargeFormSchema = z
  .object({
    amount: amountSchema(RECHARGE_MIN_AMOUNT, 'wallet:forms.errors.amountTooSmall'),
    method: methodSchema,
    phone: z.string(),
  })
  .superRefine(checkPhone);
export type RechargeFormValues = z.infer<typeof rechargeFormSchema>;

export const withdrawFormSchema = z
  .object({
    amount: amountSchema(WITHDRAWAL_MIN_AMOUNT, 'wallet:forms.errors.withdrawalTooSmall'),
    method: methodSchema,
    phone: z.string(),
  })
  .superRefine(checkPhone);
export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

/** Valeurs brutes d'un formulaire de paiement, avant conversion. */
export interface PaymentFormInput {
  amount: string;
  method: string;
  phone: string;
}

/** Corps de `POST /wallet/recharge` et de `POST /wallet/withdraw`. */
export interface PaymentPayload {
  amount: number;
  method: string;
  phoneNumber: string | null;
}

const toPayload = (values: PaymentFormInput): PaymentPayload => ({
  amount: Number(values.amount),
  method: values.method,
  phoneNumber: isMobileMethod(values.method) ? values.phone.trim() : null,
});

export const toRechargePayload = (values: PaymentFormInput): PaymentPayload => toPayload(values);
export const toWithdrawalPayload = (values: PaymentFormInput): PaymentPayload => toPayload(values);
