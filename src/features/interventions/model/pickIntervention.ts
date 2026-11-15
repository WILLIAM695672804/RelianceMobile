import type { Intervention } from '../schemas/interventionSchemas';

/** Date de référence d'une intervention : clôture, démarrage, planification, à défaut création. */
function timeOf(intervention: Intervention): number {
  const stamp =
    intervention.completed_at ?? intervention.started_at ?? intervention.scheduled_at ?? null;
  return stamp === null ? 0 : new Date(stamp).getTime();
}

/** Intervention la plus récente attachée à une mission, `null` si aucune. */
export function interventionForJob(
  interventions: readonly Intervention[],
  jobId: string,
): Intervention | null {
  return pickLatest(interventions.filter((item) => item.job_id === jobId));
}

/** Intervention la plus récente attachée à une demande, `null` si aucune. */
export function interventionForRequest(
  interventions: readonly Intervention[],
  requestId: string,
): Intervention | null {
  return pickLatest(interventions.filter((item) => item.request_id === requestId));
}

function pickLatest(matching: readonly Intervention[]): Intervention | null {
  if (matching.length === 0) return null;
  return [...matching].sort((left, right) => timeOf(right) - timeOf(left))[0] ?? null;
}
