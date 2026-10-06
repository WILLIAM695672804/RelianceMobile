/**
 * Feature `agency` — espace agence (E07) : fiche et équipe.
 *
 * Dépend de l'API publique de `@/features/directory` (choix d'un technicien à rattacher).
 * @packageDocumentation
 */

export { agencyKeys } from './hooks/agencyKeys';
export {
  useAddAgencyMember,
  useAgency,
  useAgencyMembers,
  useCreateAgency,
  useMyAgency,
  useRemoveAgencyMember,
  useUpdateAgency,
} from './hooks/useAgency';
export { agencyTranslations } from './i18n';
export { AgencyScreen, type AgencyScreenProps } from './screens/AgencyScreen';
export { AgencyTeamScreen, type AgencyTeamScreenProps } from './screens/AgencyTeamScreen';
export type {
  Agency,
  AgencyMember,
  AgencyMembership,
  AgencyPayload,
} from './schemas/agencySchemas';
