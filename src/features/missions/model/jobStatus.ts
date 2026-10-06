import type { BadgeTone } from '@/shared/components';

/** Statuts d'une mission (`technician_jobs.status`). */
export const JOB_STATUSES = [
  'pending',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Statuts d'une phase de travail. */
export const PHASE_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

/** Étapes présentées dans la frise de suivi ; l'annulation en est exclue. */
export const JOB_TIMELINE: JobStatus[] = [
  'pending',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
];

/** Transition proposée au technicien pour chaque statut. */
const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  pending: 'en_route',
  en_route: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
};

export const JOB_STATUS_TONES: Record<JobStatus, BadgeTone> = {
  pending: 'neutral',
  en_route: 'warning',
  arrived: 'warning',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const isKnownStatus = (status: string): status is JobStatus =>
  (JOB_STATUSES as readonly string[]).includes(status);

/** Statut suivant, ou `null` si la mission est close ou le statut inconnu. */
export function nextStatusOf(status: string): JobStatus | null {
  return isKnownStatus(status) ? (NEXT_STATUS[status] ?? null) : null;
}

/** Position dans la frise, ou `-1` hors frise (annulation, statut inconnu). */
export function timelineIndexOf(status: string): number {
  return isKnownStatus(status) ? JOB_TIMELINE.indexOf(status) : -1;
}

export function isJobClosed(status: string): boolean {
  return status === 'completed' || status === 'cancelled';
}

export function toneOf(status: string): BadgeTone {
  return isKnownStatus(status) ? JOB_STATUS_TONES[status] : 'neutral';
}

/** Cycle du statut d'une phase au toucher. */
export function nextPhaseStatus(status: PhaseStatus): PhaseStatus {
  const index = PHASE_STATUSES.indexOf(status);
  return PHASE_STATUSES[(index + 1) % PHASE_STATUSES.length] ?? 'pending';
}
