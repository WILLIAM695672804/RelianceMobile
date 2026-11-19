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
export { TechnicianProfileSummary } from './screens/TechnicianProfileSummary';
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
export { MatchingView, type MatchingViewProps } from './ui/MatchingView';
export { expiryState, isActionable } from './model/proposalExpiry';
export {
  MatchingContainer,
  matchedToSummary,
  type MatchingContainerProps,
} from './containers/MatchingContainer';
export {
  RadarContainer,
  toRadarProposal,
  type RadarContainerProps,
} from './containers/RadarContainer';
export { RadarView, type RadarProposal, type RadarViewProps } from './ui/RadarView';
