import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import { paymentResponseSchema, type Payment } from '../schemas/paymentSchemas';

const segment = encodeURIComponent;

/** `GET /payments/{id}` : état d'un paiement du portefeuille. */
export async function fetchPayment(client: AxiosInstance, id: string): Promise<Payment> {
  const { data } = await client.get(`/payments/${segment(id)}`);
  return parseResponse(paymentResponseSchema, data).data;
}

/**
 * `POST /payments/{id}/confirm` : règle le paiement en attente. L'API ne vérifie aucun code ;
 * la validation se fait sur le téléphone, auprès de l'opérateur.
 */
export async function confirmPayment(client: AxiosInstance, id: string): Promise<void> {
  await client.post(`/payments/${segment(id)}/confirm`, {});
}
