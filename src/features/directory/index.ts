/**
 * Feature `directory` — annuaire public des techniciens vérifiés et profil public.
 *
 * Dépend de l'API publique de `@/features/matching` (résumé de profil public).
 * @packageDocumentation
 */

export { directoryKeys } from './hooks/directoryKeys';
export { useTechnicianDirectory } from './hooks/useDirectory';
export { directoryTranslations } from './i18n';
export { rankTechnicians, type RankedTechnician } from './model/ranking';
export { createSearchHistory, HISTORY_LIMIT, type SearchHistory } from './model/searchHistory';
export { LeaderboardScreen, type LeaderboardScreenProps } from './screens/LeaderboardScreen';
export { SearchScreen, type SearchScreenProps } from './screens/SearchScreen';
export {
  TechnicianDirectoryScreen,
  type TechnicianDirectoryScreenProps,
} from './screens/TechnicianDirectoryScreen';
export {
  TechnicianPublicProfileScreen,
  type TechnicianPublicProfileScreenProps,
} from './screens/TechnicianPublicProfileScreen';
export { technicianPageSchema } from './schemas/directorySchemas';
export type { TechnicianCard, TechnicianFilters } from './schemas/directorySchemas';
export { highlight, technicianResult, type SearchResult } from './model/searchResults';
export {
  SearchView,
  type SearchFilter,
  type SearchViewProps,
  type TrendingTopic,
} from './ui/SearchView';
export { MapView, type MapViewProps } from './ui/MapView';
export {
  TechProfileView,
  type TechProfile,
  type TechProfileViewProps,
  type TechReview,
  type TechWork,
} from './ui/TechProfileView';
