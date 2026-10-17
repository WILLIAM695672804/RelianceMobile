import { isHoldActive, type Hold } from '../schemas/holdSchemas';

/**
 * Gel correspondant à une demande. Le serveur n'attache aucun identifiant de demande à un
 * gel : le motif, rédigé à la mise sous séquestre, est le seul lien. À défaut de motif
 * concordant, le gel actif le plus ancien est retenu.
 */
export function holdForRequest(holds: readonly Hold[], requestId: string): Hold | null {
  const active = holds.filter((hold) => isHoldActive(hold.status));
  const tagged = active.find((hold) => (hold.reason ?? '').includes(requestId));
  return tagged ?? active[active.length - 1] ?? null;
}
