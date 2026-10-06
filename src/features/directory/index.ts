/**
 * Feature `directory` — annuaire public des techniciens vérifiés et profil public.
 *
 * Dépend de l'API publique de `@/features/matching` (résumé de profil public).
 * @packageDocumentation
 */

export { directoryKeys } from './hooks/directoryKeys';
export { useTechnicianDirectory } from './hooks/useDirectory';
export { directoryTranslations } from './i18n';
export {
  TechnicianDirectoryScreen,
  type TechnicianDirectoryScreenProps,
} from './screens/TechnicianDirectoryScreen';
export {
  TechnicianPublicProfileScreen,
  type TechnicianPublicProfileScreenProps,
} from './screens/TechnicianPublicProfileScreen';
export type { TechnicianCard, TechnicianFilters } from './schemas/directorySchemas';
