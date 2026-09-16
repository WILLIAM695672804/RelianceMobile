import type { Skill } from '../schemas/skillSchemas';

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

const byName = (left: string, right: string) => left.localeCompare(right, 'fr');

/**
 * Compétences regroupées par catégorie, triées alphabétiquement ;
 * les compétences sans catégorie forment un dernier groupe intitulé `fallbackCategory`.
 */
export function groupSkillsByCategory(skills: Skill[], fallbackCategory: string): SkillGroup[] {
  const groups = new Map<string, Skill[]>();
  const orphans: Skill[] = [];
  for (const skill of skills) {
    if (!skill.category) {
      orphans.push(skill);
      continue;
    }
    groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]);
  }
  const sorted = [...groups.entries()]
    .sort(([left], [right]) => byName(left, right))
    .map(([category, members]) => ({
      category,
      skills: [...members].sort((left, right) => byName(left.name, right.name)),
    }));
  if (orphans.length > 0) {
    sorted.push({
      category: fallbackCategory,
      skills: orphans.sort((left, right) => byName(left.name, right.name)),
    });
  }
  return sorted;
}
