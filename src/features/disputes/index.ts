/**
 * Feature `disputes` — litiges : ouverture (`POST /disputes`), suivi du dossier et
 * échanges avec la médiation (`/disputes/{id}/message`).
 * @packageDocumentation
 */

export { disputesKeys } from './hooks/disputesKeys';
export {
  useDispute,
  useDisputes,
  useOpenDispute,
  usePostDisputeMessage,
} from './hooks/useDisputes';
export { disputesTranslations } from './i18n';
export { DISPUTE_TONES } from './model/disputeTones';
export { DisputesScreen, type DisputesScreenProps } from './screens/DisputesScreen';
export { DisputeThreadScreen, type DisputeThreadScreenProps } from './screens/DisputeThreadScreen';
export {
  DISPUTE_REASONS,
  isDisputeClosed,
  type Dispute,
  type DisputeMessage,
  type DisputePayload,
  type DisputeReason,
  type DisputeStatus,
} from './schemas/disputeSchemas';
export {
  DisputeView,
  type DisputeReasonOption,
  type DisputeValues,
  type DisputeViewProps,
} from './ui/DisputeView';
export {
  DisputeFormContainer,
  type DisputeFormContainerProps,
} from './containers/DisputeFormContainer';
