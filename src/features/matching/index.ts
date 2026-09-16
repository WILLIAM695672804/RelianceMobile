/**
 * Feature `matching` — résultats du rapprochement (E11), profil du technicien et proposition (E12),
 * accueil technicien : mission en cours et propositions reçues (E06).
 *
 * Dépend de l'API publique de `@/features/requests` (clés de cache, lecture d'une demande).
 * @packageDocumentation
 */

export { matchingKeys } from './hooks/matchingKeys';
export { useMatchResults, useSelectTechnician, useTechnicianProfile } from './hooks/useMatching';
export {
  useAcceptProposal,
  useActiveMission,
  useProposalsSync,
  useReceivedProposals,
  useRefuseProposal,
} from './hooks/useProposals';
export { matchingTranslations } from './i18n';
export { MatchingScreen, type MatchingScreenProps } from './screens/MatchingScreen';
export { TechnicianHomeScreen } from './screens/TechnicianHomeScreen';
export {
  TechnicianOfferScreen,
  type TechnicianOfferScreenProps,
} from './screens/TechnicianOfferScreen';
export type {
  ActiveMission,
  MatchedTechnician,
  OfferPayload,
  ReceivedProposal,
  TechnicianProfile,
} from './schemas/matchingSchemas';
