import type { PillTone as BadgeTone } from '@/shared/ui';

import type { DisputeStatus } from '../schemas/disputeSchemas';

/** Ton de la pastille d'état : un litige ouvert alerte, un litige résolu rassure. */
export const DISPUTE_TONES: Record<DisputeStatus, BadgeTone> = {
  open: 'warning',
  in_review: 'primary',
  resolved: 'success',
  closed: 'neutral',
};
