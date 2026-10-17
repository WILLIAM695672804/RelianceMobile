import { z } from 'zod';

export const INTERVENTION_STATUSES = ['planned', 'in_progress', 'completed'] as const;
export type InterventionStatus = (typeof INTERVENTION_STATUSES)[number];

/** Personne attachée à l'intervention ; seuls les champs employés sont retenus. */
const party = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
});

export const interventionSchema = z.object({
  id: z.string(),
  job_id: z.string().nullish(),
  request_id: z.string().nullish(),
  technician_id: z.string().nullish(),
  type: z.string().nullish(),
  status: z.enum(INTERVENTION_STATUSES).catch('planned'),
  description: z.string().nullish(),
  work_performed: z.string().nullish(),
  /** Le serveur renvoie un tableau de chaînes, ou `null` si rien n'a été employé. */
  materials_used: z.array(z.string()).nullish(),
  /** Décimal transmis en chaîne (« 1.50 ») par la base. */
  duration_hours: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  scheduled_at: z.string().nullish(),
  started_at: z.string().nullish(),
  completed_at: z.string().nullish(),
  technician: party.nullish(),
  request: z.object({ id: z.string(), title: z.string().nullish() }).nullish(),
});
export type Intervention = z.infer<typeof interventionSchema>;

export const interventionResponseSchema = z.object({ data: interventionSchema });

/** `GET /interventions` : pagination Laravel imbriquée sous `data`. */
export const interventionListResponseSchema = z.object({
  data: z.object({
    data: z.array(interventionSchema),
    current_page: z.number().nullish(),
    last_page: z.number().nullish(),
    total: z.number().nullish(),
  }),
});

export const WORK_MAX_LENGTH = 4000;

/** Formulaire du rapport ; le travail effectué est seul obligatoire côté serveur. */
export const reportFormSchema = z.object({
  workPerformed: z
    .string()
    .trim()
    .min(1, 'interventions:report.errors.workRequired')
    .max(WORK_MAX_LENGTH, 'interventions:report.errors.workTooLong'),
  materials: z.string().max(WORK_MAX_LENGTH, 'interventions:report.errors.materialsTooLong'),
  hours: z
    .string()
    .trim()
    .refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0), {
      message: 'interventions:report.errors.hoursInvalid',
    }),
  notes: z.string().max(WORK_MAX_LENGTH, 'interventions:report.errors.notesTooLong'),
});
export type ReportFormValues = z.infer<typeof reportFormSchema>;

export interface ReportPayload {
  workPerformed: string;
  materials: string[];
  hours: number | null;
  notes: string | null;
}

/** Une pièce par ligne saisie ; les lignes vides sont écartées. */
export function toReportPayload(values: ReportFormValues): ReportPayload {
  return {
    workPerformed: values.workPerformed.trim(),
    materials: values.materials
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    hours: values.hours.trim() === '' ? null : Number(values.hours),
    notes: values.notes.trim() || null,
  };
}
