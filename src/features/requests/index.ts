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
export { ClientHomeScreen, type ClientHomeScreenProps } from './screens/ClientHomeScreen';
export { NewRequestScreen, type NewRequestScreenProps } from './screens/NewRequestScreen';
export { RequestDetailScreen, type RequestDetailScreenProps } from './screens/RequestDetailScreen';
export type { CreateRequestPayload, RequestStatus, ServiceRequest } from './schemas/requestSchemas';
