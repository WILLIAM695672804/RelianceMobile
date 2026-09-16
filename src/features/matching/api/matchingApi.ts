import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import { rankTechnicians } from '../model/ranking';
import {
  activeMissionResponseSchema,
  matchResponseSchema,
  messageResponseSchema,
  proposalSentResponseSchema,
  receivedProposalsResponseSchema,
  technicianProfileResponseSchema,
  type ActiveMission,
  type MatchedTechnician,
  type OfferPayload,
  type ReceivedProposal,
  type SentProposal,
  type TechnicianProfile,
} from '../schemas/matchingSchemas';

const segment = encodeURIComponent;

/** `POST /requests/{id}/match` : techniciens vérifiés classés par score (cinq au plus). */
export async function findTechnicians(
  client: AxiosInstance,
  requestId: string,
): Promise<MatchedTechnician[]> {
  const { data } = await client.post(`/requests/${segment(requestId)}/match`);
  return rankTechnicians(parseResponse(matchResponseSchema, data).data.technicians);
}

/** `POST /requests/{id}/select-technician` : proposition envoyée au technicien. */
export async function selectTechnician(
  client: AxiosInstance,
  requestId: string,
  payload: OfferPayload,
): Promise<SentProposal> {
  const { data } = await client.post(`/requests/${segment(requestId)}/select-technician`, {
    technician_id: payload.technicianId,
    price: payload.price,
    message: payload.message,
  });
  return parseResponse(proposalSentResponseSchema, data).data;
}

/** `GET /technicians/{id}/profile` (route publique). */
export async function fetchTechnicianProfile(
  client: AxiosInstance,
  technicianId: string,
): Promise<TechnicianProfile> {
  const { data } = await client.get(`/technicians/${segment(technicianId)}/profile`);
  return parseResponse(technicianProfileResponseSchema, data).data;
}

/** `GET /proposals/my` : première page des propositions reçues par le technicien. */
export async function fetchReceivedProposals(client: AxiosInstance): Promise<ReceivedProposal[]> {
  const { data } = await client.get('/proposals/my');
  return parseResponse(receivedProposalsResponseSchema, data).data.data;
}

/** `GET /proposals/active-mission` : mission acceptée en cours, ou `null`. */
export async function fetchActiveMission(client: AxiosInstance): Promise<ActiveMission | null> {
  const { data } = await client.get('/proposals/active-mission');
  return parseResponse(activeMissionResponseSchema, data).data;
}

/** `POST /proposals/{id}/accept` (410 si la proposition a expiré). */
export async function acceptProposal(client: AxiosInstance, proposalId: string): Promise<string> {
  const { data } = await client.post(`/proposals/${segment(proposalId)}/accept`);
  return parseResponse(messageResponseSchema, data).message;
}

/** `POST /proposals/{id}/refuse`. */
export async function refuseProposal(client: AxiosInstance, proposalId: string): Promise<string> {
  const { data } = await client.post(`/proposals/${segment(proposalId)}/refuse`);
  return parseResponse(messageResponseSchema, data).message;
}
