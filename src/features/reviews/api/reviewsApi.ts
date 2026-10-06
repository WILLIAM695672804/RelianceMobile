import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  badgeListResponseSchema,
  reputationResponseSchema,
  reviewCreatedResponseSchema,
  reviewPageResponseSchema,
  type Badge,
  type Reputation,
  type Review,
  type ReviewPayload,
} from '../schemas/reviewSchemas';

const segment = encodeURIComponent;

/** `POST /reviews` : la demande doit être clôturée et appartenir au client. */
export async function submitReview(client: AxiosInstance, payload: ReviewPayload): Promise<Review> {
  const body: Record<string, unknown> = {
    request_id: payload.requestId,
    rating: payload.rating,
  };
  if (payload.comment) body.comment = payload.comment;
  const { data } = await client.post('/reviews', body);
  return parseResponse(reviewCreatedResponseSchema, data).data;
}

/** `GET /reviews/technician/{id}` (route publique). */
export async function fetchTechnicianReviews(
  client: AxiosInstance,
  technicianId: string,
): Promise<Review[]> {
  const { data } = await client.get(`/reviews/technician/${segment(technicianId)}`);
  return parseResponse(reviewPageResponseSchema, data).data.data;
}

/** `GET /reviews/mine` : avis reçus par le technicien connecté. */
export async function fetchMyReviews(client: AxiosInstance): Promise<Review[]> {
  const { data } = await client.get('/reviews/mine');
  return parseResponse(reviewPageResponseSchema, data).data.data;
}

/** `GET /badges/user/{id}`. */
export async function fetchUserBadges(client: AxiosInstance, userId: string): Promise<Badge[]> {
  const { data } = await client.get(`/badges/user/${segment(userId)}`);
  return parseResponse(badgeListResponseSchema, data).data;
}

/** `GET /reputation/{id}` : changements de réputation et total. */
export async function fetchReputation(client: AxiosInstance, userId: string): Promise<Reputation> {
  const { data } = await client.get(`/reputation/${segment(userId)}`);
  return parseResponse(reputationResponseSchema, data);
}
