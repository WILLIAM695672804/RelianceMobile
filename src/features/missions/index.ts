/**
 * Feature `missions` — cockpit du technicien (E13, E14), phases de travail (E18),
 * historique des missions et suivi client (E15).
 *
 * Dépend de l'API publique de `@/features/matching` (mission acceptée, clés de cache).
 * @packageDocumentation
 */

export { missionsKeys } from './hooks/missionsKeys';
export {
  useClientMission,
  useCreateJob,
  useJob,
  useJobs,
  useJobSync,
  useJobTracking,
  useShareMyPosition,
  useTechnicianPosition,
  useUpdateJobPhases,
  useUpdateJobStatus,
} from './hooks/useMissions';
export { missionsTranslations } from './i18n';
export {
  isJobClosed,
  JOB_STATUSES,
  JOB_TIMELINE,
  nextStatusOf,
  timelineIndexOf,
  toneOf,
  type JobStatus,
  type PhaseStatus,
} from './model/jobStatus';
export { JobDetailScreen, type JobDetailScreenProps } from './screens/JobDetailScreen';
export {
  MissionCockpitScreen,
  type MissionCockpitScreenProps,
} from './screens/MissionCockpitScreen';
export {
  CancelMissionScreen,
  CANCEL_REASONS,
  type CancelMissionScreenProps,
  type CancelReason,
} from './screens/CancelMissionScreen';
export {
  QualityControlScreen,
  type QualityControlScreenProps,
} from './screens/QualityControlScreen';
export {
  MissionTrackingScreen,
  type MissionTrackingScreenProps,
} from './screens/MissionTrackingScreen';
export {
  TechnicianJobsScreen,
  type TechnicianJobsScreenProps,
} from './screens/TechnicianJobsScreen';
export type {
  ClientMission,
  Job,
  JobPhase,
  JobTracking,
  LivePosition,
} from './schemas/missionSchemas';
export { TrackingView, type TrackingPhase, type TrackingViewProps } from './ui/TrackingView';
export {
  CancelView,
  MissionClosedView,
  ValidationView,
  type CancelViewProps,
  type MissionClosedViewProps,
  type ValidationViewProps,
  type WorkCheck,
} from './ui/CompletionViews';
export {
  TechHomeView,
  type AgendaSlot,
  type IncomingRequest,
  type TechHomeViewProps,
} from './ui/TechHomeView';
