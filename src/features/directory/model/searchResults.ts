import { formatRating } from '@/shared/format';

import type { TechnicianCard } from '../schemas/directorySchemas';

/** Résultat affiché par la recherche universelle (maquette `SearchScreen`). */
export interface SearchResult {
  id: string;
  kind: 'pro' | 'post';
  title: string;
  /** Ligne secondaire : métier, ville, note. */
  subtitle: string;
}

/** Projette un technicien de l'annuaire en résultat : « Plombier · Bastos · 4,9 ★ ». */
export function technicianResult(technician: TechnicianCard): SearchResult {
  const parts = [
    technician.skills[0]?.name,
    technician.location?.city,
    technician.rating != null ? `${formatRating(technician.rating)} ★` : undefined,
  ].filter((part): part is string => Boolean(part && part.trim()));
  return { id: technician.id, kind: 'pro', title: technician.name, subtitle: parts.join(' · ') };
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

/** Découpe `text` autour des occurrences de `query`, sans tenir compte de la casse. */
export function highlight(text: string, query: string): HighlightPart[] {
  const needle = query.trim().toLocaleLowerCase('fr');
  if (needle === '') return [{ text, match: false }];
  const haystack = text.toLocaleLowerCase('fr');
  const parts: HighlightPart[] = [];
  let cursor = 0;
  let found = haystack.indexOf(needle, cursor);
  while (found !== -1) {
    if (found > cursor) parts.push({ text: text.slice(cursor, found), match: false });
    parts.push({ text: text.slice(found, found + needle.length), match: true });
    cursor = found + needle.length;
    found = haystack.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
