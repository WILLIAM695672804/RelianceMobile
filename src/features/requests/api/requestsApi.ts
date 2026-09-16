import type { AxiosInstance } from 'axios';

import { appendFile, MULTIPART_HEADERS, parseResponse } from '@/core/api';

import {
  requestEnvelopeSchema,
  requestPageSchema,
  type CreateRequestPayload,
  type RequestPage,
  type ServiceRequest,
} from '../schemas/requestSchemas';

/** `GET /requests` : première page des demandes du client (15 par page, les plus récentes d'abord). */
export async function fetchRequests(client: AxiosInstance): Promise<RequestPage> {
  const { data } = await client.get('/requests');
  return parseResponse(requestPageSchema, data);
}

/** `GET /requests/{id}`. */
export async function fetchRequest(client: AxiosInstance, id: string): Promise<ServiceRequest> {
  const { data } = await client.get(`/requests/${encodeURIComponent(id)}`);
  return parseResponse(requestEnvelopeSchema, data).data;
}

/** `POST /requests` (multipart ; photos en `photos[i]`) : demande créée et analysée. */
export async function createRequest(
  client: AxiosInstance,
  payload: CreateRequestPayload,
): Promise<ServiceRequest> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('description', payload.description);
  form.append('category_slug', payload.categorySlug);
  form.append('latitude', String(payload.latitude));
  form.append('longitude', String(payload.longitude));
  if (payload.addressLabel) form.append('address_label', payload.addressLabel);
  if (payload.city) form.append('city', payload.city);
  payload.photos.forEach((photo, index) => appendFile(form, `photos[${index}]`, photo));
  const { data } = await client.post('/requests', form, { headers: MULTIPART_HEADERS });
  return parseResponse(requestEnvelopeSchema, data).data;
}
