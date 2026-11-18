import { useEffect, useState } from 'react';

import { normalizeError } from '@/core/errors';
import { groupSkillsByCategory, useSkillCatalog } from '@/features/profile';

import { useTechnicianDirectory } from '../hooks/useDirectory';
import type { SearchHistory } from '../model/searchHistory';
import { technicianResult } from '../model/searchResults';
import type { TechnicianCard } from '../schemas/directorySchemas';
import { SearchView } from '../ui/SearchView';

/** Délai de stabilisation de la saisie avant interrogation du serveur. */
const DEBOUNCE_MS = 350;

/** Domaines du catalogue proposés en filtres. */
const MAX_FILTERS = 8;

/** Techniciens dont une compétence relève d'un des domaines retenus (tous si aucun). */
export function filterByDomains(
  technicians: readonly TechnicianCard[],
  domains: ReadonlySet<string>,
): TechnicianCard[] {
  if (domains.size === 0) return [...technicians];
  return technicians.filter((technician) =>
    technician.skills.some((skill) => skill.category != null && domains.has(skill.category)),
  );
}

export interface SearchContainerProps {
  history: SearchHistory;
  onBack: () => void;
  onOpen: (technicianId: string) => void;
  onBrowseCategories?: () => void;
}

/** Recherche de techniciens : saisie temporisée, filtres par domaine, historique local. */
export function SearchContainer({
  history,
  onBack,
  onOpen,
  onBrowseCategories,
}: SearchContainerProps) {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState(() => history.read());
  const [domains, setDomains] = useState<ReadonlySet<string>>(new Set());
  const catalog = useSkillCatalog();
  const directory = useTechnicianDirectory({ search, coordinates: null });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const remember = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    history.remember(trimmed);
    setRecent(history.read());
  };

  const filters = groupSkillsByCategory(catalog.data ?? [], '')
    .map((group) => group.category)
    .filter(Boolean)
    .slice(0, MAX_FILTERS)
    .map((key) => ({ key, label: key, selected: domains.has(key) }));

  const status = !search
    ? 'idle'
    : directory.isPending
      ? 'loading'
      : directory.isError
        ? 'error'
        : 'ready';

  return (
    <SearchView
      query={query}
      onQueryChange={setQuery}
      onSubmit={() => {
        setSearch(query.trim());
        remember(query);
      }}
      filters={filters}
      onToggleFilter={(key) =>
        setDomains((current) => {
          const next = new Set(current);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        })
      }
      onClearFilters={() => setDomains(new Set())}
      recent={recent}
      onPickRecent={(term) => {
        setQuery(term);
        setSearch(term);
      }}
      onClearRecent={() => {
        history.clear();
        setRecent([]);
      }}
      status={status}
      results={filterByDomains(directory.data?.technicians ?? [], domains).map(technicianResult)}
      errorKind={directory.isError ? normalizeError(directory.error).kind : undefined}
      onRetry={() => void directory.refetch()}
      onOpenResult={(result) => {
        remember(query);
        onOpen(result.id);
      }}
      onBrowseCategories={onBrowseCategories}
      onBack={onBack}
    />
  );
}
