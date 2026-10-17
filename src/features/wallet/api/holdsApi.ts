import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  holdCaptureResponseSchema,
  holdListResponseSchema,
  holdResponseSchema,
  type CapturePayload,
  type Hold,
} from '../schemas/holdSchemas';

const segment = encodeURIComponent;

/** `GET /holds` : gels du portefeuille de la personne connectée. */
export async function fetchHolds(client: AxiosInstance): Promise<Hold[]> {
  const { data } = await client.get('/holds');
  return parseResponse(holdListResponseSchema, data).data;
}

/** `POST /holds` : gèle un montant en séquestre. */
export async function placeHold(
  client: AxiosInstance,
  input: { amount: number; reason: string },
): Promise<Hold | null> {
  const { data } = await client.post('/holds', { amount: input.amount, reason: input.reason });
  return parseResponse(holdResponseSchema, data).data ?? null;
}

/** `POST /holds/{id}/capture` : verse les fonds gelés au bénéficiaire. */
export async function captureHold(
  client: AxiosInstance,
  id: string,
  payload: CapturePayload,
): Promise<string> {
  const { data } = await client.post(`/holds/${segment(id)}/capture`, {
    payee_id: payload.payeeId,
    method: payload.method,
  });
  return parseResponse(holdCaptureResponseSchema, data).payment_id;
}

/** `POST /holds/{id}/release` : rend les fonds gelés au payeur. */
export async function releaseHold(client: AxiosInstance, id: string): Promise<Hold | null> {
  const { data } = await client.post(`/holds/${segment(id)}/release`, {});
  return parseResponse(holdResponseSchema, data).data ?? null;
}
