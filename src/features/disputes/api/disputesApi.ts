import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  disputeMessageResponseSchema,
  disputePageResponseSchema,
  disputeResponseSchema,
  type Dispute,
  type DisputeMessage,
  type DisputePayload,
} from '../schemas/disputeSchemas';

const segment = encodeURIComponent;

/** `GET /disputes` : litiges ouverts par la personne connectée ou dirigés contre elle. */
export async function fetchDisputes(client: AxiosInstance): Promise<Dispute[]> {
  const { data } = await client.get('/disputes');
  return parseResponse(disputePageResponseSchema, data).data;
}

/** `GET /disputes/{id}` : détail et fil des messages. */
export async function fetchDispute(client: AxiosInstance, id: string): Promise<Dispute> {
  const { data } = await client.get(`/disputes/${segment(id)}`);
  return parseResponse(disputeResponseSchema, data).data;
}

/** `POST /disputes` : ouvre un litige sur une demande, contre l'autre partie. */
export async function openDispute(
  client: AxiosInstance,
  payload: DisputePayload,
): Promise<Dispute> {
  const { data } = await client.post('/disputes', {
    request_id: payload.requestId,
    against: payload.against,
    reason: payload.reason,
    description: payload.description,
  });
  return parseResponse(disputeResponseSchema, data).data;
}

/** `POST /disputes/{id}/message` : refusé par le serveur si le litige est clos. */
export async function postDisputeMessage(
  client: AxiosInstance,
  id: string,
  message: string,
): Promise<DisputeMessage> {
  const { data } = await client.post(`/disputes/${segment(id)}/message`, { message });
  return parseResponse(disputeMessageResponseSchema, data).data;
}
