import type { IconName } from '@/shared/components';

/** Normalise un libellé de domaine : minuscules, sans diacritiques. */
function normalize(label: string): string {
  return label.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Icône d'un domaine du catalogue de compétences. Les correspondances reprennent les
 * icônes des maquettes (`screens-client.jsx`) ; un domaine inconnu reçoit l'icône
 * générique, le catalogue étant servi par le serveur et donc susceptible de s'étendre.
 */
const ICON_BY_CATEGORY: Record<string, IconName> = {
  plomberie: 'wrench',
  electricite: 'bolt',
  securite: 'camera',
  informatique: 'laptop',
  electronique: 'plug',
  mecanique: 'cog',
  climatisation: 'sun',
  batiment: 'home',
};

export const FALLBACK_CATEGORY_ICON: IconName = 'cog';

export function iconForCategory(category: string | null | undefined): IconName {
  if (!category) return FALLBACK_CATEGORY_ICON;
  return ICON_BY_CATEGORY[normalize(category)] ?? FALLBACK_CATEGORY_ICON;
}
