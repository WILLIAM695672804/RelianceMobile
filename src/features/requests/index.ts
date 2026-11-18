/**
 * Feature `requests` — accueil client (E05), création d'une demande (E10) et détail d'une demande.
 *
 * Dépend de l'API publique de `@/features/profile` (catalogue des compétences).
 * @packageDocumentation
 */

export { requestsKeys } from './hooks/requestsKeys';
export { useCreateRequest, useRequest, useRequests } from './hooks/useRequests';
export { requestsTranslations } from './i18n';
export {
  countOpenRequests,
  isOpenRequest,
  MAX_OPEN_REQUESTS,
  stageOf,
  STAGE_TONES,
  type RequestStage,
} from './model/requestStage';
export { RequestDetailScreen, type RequestDetailScreenProps } from './screens/RequestDetailScreen';
export { RequestsListScreen, type RequestsListScreenProps } from './screens/RequestsListScreen';
export type { CreateRequestPayload, RequestStatus, ServiceRequest } from './schemas/requestSchemas';
export type { ServiceCategory } from './model/categories';
export {
  ClientHomeView,
  type ActiveIntervention,
  type ClientHomeViewProps,
} from './ui/ClientHomeView';
export {
  NewRequestView,
  type NewRequestValues,
  type NewRequestViewProps,
  type RequestPlace,
  type Urgency,
} from './ui/NewRequestView';
export {
  DiagnosticView,
  type DiagnosticReport,
  type DiagnosticViewProps,
} from './ui/DiagnosticView';
export { iconForCategory } from './model/categoryIcons';
export {
  NewRequestContainer,
  skillTiles,
  toRequestPlace,
  type NewRequestContainerProps,
} from './containers/NewRequestContainer';
