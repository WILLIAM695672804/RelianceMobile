import { z } from 'zod';

import { decimalSchema } from '@/core/api';

import { PHASE_STATUSES, type PhaseStatus } from '../model/jobStatus';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Phase de travail d'une mission. */
export const jobPhaseSchema = z.object({
  title: z.string(),
  status: z.enum(PHASE_STATUSES).or(z.string()),
  notes: z.string().nullish(),
});
export type JobPhase = z.infer<typeof jobPhaseSchema>;

/**
 * Mission du technicien (`JobResource`). `route` et `estimated_travel_seconds`,
 * toujours nuls côté serveur, ne sont pas repris.
 */
export const jobSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  technician_id: z.string().nullish(),
  appointment_id: z.string().nullish(),
  request: z.object({ id: z.string(), title: z.string(), status: z.string().nullish() }).nullish(),
  technician: z.object({ id: z.string(), name: z.string() }).nullish(),
  status: z.string(),
  phases: z.array(jobPhaseSchema).nullish().transform(asList),
  completion_notes: z.string().nullish(),
  started_at: z.string().nullable().default(null),
  completed_at: z.string().nullable().default(null),
  created_at: z.string().nullish(),
});
export type Job = z.infer<typeof jobSchema>;

export const jobResponseSchema = z.object({ data: jobSchema });

export const jobPageSchema = z.object({
  data: z.array(jobSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/** Suivi d'une mission (`GET /jobs/{id}/tracking`). */
export const trackingSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  phases: z.array(jobPhaseSchema).nullish().transform(asList),
  started_at: z.string().nullable().default(null),
  completed_at: z.string().nullable().default(null),
  technician: z.object({ id: z.string(), name: z.string() }).nullish(),
});
export type JobTracking = z.infer<typeof trackingSchema>;

export const trackingResponseSchema = z.object({ data: trackingSchema });

/** Mission en cours du client (`GET /mission/active`). */
export const clientMissionSchema = z.object({
  job_id: z.string().nullish(),
  request: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    status: z.string(),
    category: z.string().nullish(),
    created_at: z.string().nullish(),
  }),
  address: z
    .object({
      label: z.string().nullish(),
      city: z.string().nullish(),
      address: z.string().nullish(),
      latitude: decimalSchema.nullish(),
      longitude: decimalSchema.nullish(),
    })
    .nullish(),
  proposal: z
    .object({ id: z.string(), price: decimalSchema.nullish(), status: z.string() })
    .nullish(),
  technician: z
    .object({
      id: z.string(),
      name: z.string(),
      phone: z.string().nullish(),
      avatar: z.string().nullish(),
      rating: decimalSchema.nullish(),
      num_reviews: z.number().nullish(),
    })
    .nullish(),
});
export type ClientMission = z.infer<typeof clientMissionSchema>;

export const clientMissionResponseSchema = z.object({ data: clientMissionSchema.nullable() });

/** Dernière position connue du technicien (`GET /position/technician`). */
export const livePositionSchema = z.object({
  latitude: decimalSchema,
  longitude: decimalSchema,
  updated_at: z.string().nullish(),
});
export type LivePosition = z.infer<typeof livePositionSchema>;

export const livePositionResponseSchema = z.object({ data: livePositionSchema.nullable() });

export const PHASE_TITLE_MAX_LENGTH = 120;
export const COMPLETION_NOTES_MAX_LENGTH = 2000;

/** Formulaire d'ajout d'une phase. */
export const phaseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'missions:phases.errors.titleRequired')
    .max(PHASE_TITLE_MAX_LENGTH, 'missions:phases.errors.titleTooLong'),
});
export type PhaseFormValues = z.infer<typeof phaseFormSchema>;

/** Nouvelle phase : créée au statut « à faire ». */
export function toPhasePayload(values: PhaseFormValues): JobPhase {
  return { title: values.title.trim(), status: 'pending' as PhaseStatus, notes: null };
}

/** Formulaire d'achèvement : compte rendu facultatif. */
export const completionFormSchema = z.object({
  notes: z.string().trim().max(COMPLETION_NOTES_MAX_LENGTH, 'missions:cockpit.errors.notesTooLong'),
});
export type CompletionFormValues = z.infer<typeof completionFormSchema>;

/** Corps de `PATCH /jobs/{id}/status`. */
export interface JobStatusPayload {
  status: string;
  completionNotes?: string | null;
}
