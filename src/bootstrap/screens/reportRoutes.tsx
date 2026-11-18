import { router, useLocalSearchParams } from 'expo-router';

import { ClientReportContainer } from '../containers/ClientReportContainer';
import { InterventionReportGate } from './InterventionReportGate';

/** Rapport rédigé par le technicien, ouvert depuis le cockpit. */
export function TechnicianReportRoute() {
  const { jobId, requestId } = useLocalSearchParams<{ jobId: string; requestId?: string }>();
  return (
    <InterventionReportGate
      jobId={jobId}
      requestId={requestId}
      mode="edit"
      onBack={() => router.back()}
    />
  );
}

/** Rapport consulté par le client, ouvert depuis le suivi (`/requests/<id>/report`). */
export function ClientReportRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ClientReportContainer
      requestId={id}
      onBack={() => router.back()}
      onAskQuote={() => router.push({ pathname: '/quotes/[requestId]', params: { requestId: id } })}
    />
  );
}
