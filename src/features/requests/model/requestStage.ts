import type { PillTone as BadgeTone } from '@/shared/ui';

import { REQUEST_STATUSES, type RequestStatus } from '../schemas/requestSchemas';

/** Étape d'une demande du point de vue du client. */
export type RequestStage = 'toMatch' | 'awaitingTechnician' | 'assigned' | 'closed' | 'unknown';

/** RG : cinq demandes ouvertes au plus par client (non appliqué par le serveur). */
export const MAX_OPEN_REQUESTS = 5;

const STAGE_BY_STATUS: Record<RequestStatus, RequestStage> = {
  new: 'toMatch',
  analyzed: 'toMatch',
  quoted: 'awaitingTechnician',
  assigned: 'assigned',
  completed: 'closed',
  cancelled: 'closed',
};

export const STAGE_TONES: Record<RequestStage, BadgeTone> = {
  toMatch: 'neutral',
  awaitingTechnician: 'warning',
  assigned: 'success',
  closed: 'neutral',
  unknown: 'neutral',
};

const isKnownStatus = (status: string): status is RequestStatus =>
  (REQUEST_STATUSES as readonly string[]).includes(status);

export function stageOf(status: string): RequestStage {
  return isKnownStatus(status) ? STAGE_BY_STATUS[status] : 'unknown';
}

export function isOpenRequest(status: string): boolean {
  const stage = stageOf(status);
  return stage !== 'closed' && stage !== 'unknown';
}

export function countOpenRequests(requests: { status: string }[]): number {
  return requests.filter((request) => isOpenRequest(request.status)).length;
}
