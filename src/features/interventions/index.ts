/**
 * Feature `interventions` — rapport d'intervention : rédaction par le technicien
 * (`POST /interventions/{id}/complete`), consultation par le client.
 * @packageDocumentation
 */

export { interventionsKeys } from './hooks/interventionsKeys';
export {
  useCompleteIntervention,
  useCreateIntervention,
  useIntervention,
  useInterventions,
  useStartIntervention,
} from './hooks/useInterventions';
export { interventionsTranslations } from './i18n';
export { interventionForJob, interventionForRequest } from './model/pickIntervention';
export {
  InterventionReportScreen,
  type InterventionReportScreenProps,
} from './screens/InterventionReportScreen';
export type {
  Intervention,
  InterventionStatus,
  ReportFormValues,
  ReportPayload,
} from './schemas/interventionSchemas';
