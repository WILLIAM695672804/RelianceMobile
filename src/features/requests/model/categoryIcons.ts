import type { IconName } from '@/shared/ui';

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

/**
 * Mots-clés reconnus dans le slug d'une compétence. Une demande ne porte que sa
 * compétence (`electricite-generale`, `camera-surveillance`…), jamais son domaine :
 * l'icône est donc déduite du premier mot-clé rencontré.
 */
const ICON_BY_KEYWORD: [string, IconName][] = [
  ['plomberie', 'wrench'],
  ['canalisation', 'wrench'],
  ['sanitaire', 'wrench'],
  ['fuite', 'wrench'],
  ['chauffe-eau', 'wrench'],
  ['electricite', 'bolt'],
  ['electrique', 'bolt'],
  ['eclairage', 'bolt'],
  ['camera', 'camera'],
  ['alarme', 'shield'],
  ['controle-acces', 'shield'],
  ['gps', 'location'],
  ['informatique', 'laptop'],
  ['reseau', 'laptop'],
  ['smartphone', 'plug'],
  ['tv', 'video'],
  ['mecanique', 'cog'],
  ['auto', 'cog'],
  ['climatisation', 'sun'],
  ['refrigeration', 'sun'],
  ['ventilation', 'sun'],
  ['peinture', 'home'],
  ['carrelage', 'home'],
  ['menuiserie', 'home'],
  ['soudure', 'flash'],
];

/** Icône déduite du slug d'une compétence, par recherche de mot-clé. */
export function iconForSkillSlug(slug: string | null | undefined): IconName {
  if (!slug) return FALLBACK_CATEGORY_ICON;
  const key = normalize(slug);
  const found = ICON_BY_KEYWORD.find(([keyword]) => key.includes(keyword));
  return found ? found[1] : FALLBACK_CATEGORY_ICON;
}
