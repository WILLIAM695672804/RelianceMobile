import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  paymentRequestSchema,
  transactionPageSchema,
  walletResponseSchema,
  type PaymentPayload,
  type PaymentRequestResult,
  type Transaction,
  type Wallet,
} from '../schemas/walletSchemas';

const toBody = (payload: PaymentPayload): Record<string, unknown> => {
  const body: Record<string, unknown> = { amount: payload.amount, method: payload.method };
  if (payload.phoneNumber) body.phone_number = payload.phoneNumber;
  return body;
};

/** `GET /wallet` : le portefeuille est créé à la première lecture. */
export async function fetchWallet(client: AxiosInstance): Promise<Wallet> {
  const { data } = await client.get('/wallet');
  return parseResponse(walletResponseSchema, data).data;
}

/** `GET /wallet/transactions` : première page de l'historique. */
export async function fetchTransactions(client: AxiosInstance): Promise<Transaction[]> {
  const { data } = await client.get('/wallet/transactions');
  return parseResponse(transactionPageSchema, data).data;
}

/** `POST /wallet/recharge` : initie un paiement auprès de la passerelle. */
export async function rechargeWallet(
  client: AxiosInstance,
  payload: PaymentPayload,
): Promise<PaymentRequestResult> {
  const { data } = await client.post('/wallet/recharge', toBody(payload));
  return parseResponse(paymentRequestSchema, data);
}

/** `POST /wallet/withdraw` : enregistre une demande de retrait. */
export async function requestWithdrawal(
  client: AxiosInstance,
  payload: PaymentPayload,
): Promise<PaymentRequestResult> {
  const { data } = await client.post('/wallet/withdraw', toBody(payload));
  return parseResponse(paymentRequestSchema, data);
}
