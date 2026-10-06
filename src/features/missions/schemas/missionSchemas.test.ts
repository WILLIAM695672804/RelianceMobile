import clientMission from '@/test/fixtures/missions/client-mission.json';
import jobCreated from '@/test/fixtures/missions/job-created.json';
import jobPhases from '@/test/fixtures/missions/job-phases.json';
import jobs from '@/test/fixtures/missions/jobs.json';
import technicianPosition from '@/test/fixtures/missions/technician-position.json';
import tracking from '@/test/fixtures/missions/tracking.json';

import {
  clientMissionResponseSchema,
  completionFormSchema,
  jobPageSchema,
  jobResponseSchema,
  livePositionResponseSchema,
  phaseFormSchema,
  toPhasePayload,
  trackingResponseSchema,
} from './missionSchemas';

describe('missionSchemas', () => {
  it('lit une mission créée, dont les phases sont absentes', () => {
    const job = jobResponseSchema.parse(jobCreated).data;

    expect(job.id).toBe(jobCreated.data.id);
    expect(job.status).toBe('pending');
    expect(job.phases).toEqual([]);
    expect(job.started_at).toBeNull();
  });

  it('lit les phases enregistrées et la page des missions', () => {
    const job = jobResponseSchema.parse(jobPhases).data;
    expect(job.phases).toEqual(jobPhases.data.phases);

    const page = jobPageSchema.parse(jobs);
    expect(page.data).toHaveLength(jobs.data.length);
    expect(page.meta?.total).toBe(jobs.meta.total);
  });

  it('lit le suivi d’une mission', () => {
    const parsed = trackingResponseSchema.parse(tracking).data;

    expect(parsed.job_id).toBe(tracking.data.job_id);
    expect(parsed.technician?.name).toBe(tracking.data.technician.name);
    expect(parsed.phases).toHaveLength(tracking.data.phases.length);
  });

  it('lit la mission du client et la position du technicien', () => {
    const mission = clientMissionResponseSchema.parse(clientMission).data;

    expect(mission?.job_id).toBe(clientMission.data.job_id);
    expect(typeof mission?.proposal?.price).toBe('number');
    expect(typeof mission?.address?.latitude).toBe('number');
    expect(clientMissionResponseSchema.parse({ status: 'success', data: null }).data).toBeNull();

    const position = livePositionResponseSchema.parse(technicianPosition).data;
    expect(position?.latitude).toBe(technicianPosition.data.latitude);
    expect(livePositionResponseSchema.parse({ status: 'success', data: null }).data).toBeNull();
  });

  it('valide l’intitulé d’une phase et construit sa charge utile', () => {
    expect(phaseFormSchema.safeParse({ title: 'Diagnostic' }).success).toBe(true);
    expect(phaseFormSchema.safeParse({ title: '  ' }).error?.issues[0]?.message).toBe(
      'missions:phases.errors.titleRequired',
    );
    expect(phaseFormSchema.safeParse({ title: 'x'.repeat(121) }).error?.issues[0]?.message).toBe(
      'missions:phases.errors.titleTooLong',
    );
    expect(toPhasePayload({ title: ' Diagnostic ' })).toEqual({
      title: 'Diagnostic',
      status: 'pending',
      notes: null,
    });
  });

  it('valide le compte rendu d’achèvement', () => {
    expect(completionFormSchema.safeParse({ notes: '' }).success).toBe(true);
    expect(
      completionFormSchema.safeParse({ notes: 'x'.repeat(2001) }).error?.issues[0]?.message,
    ).toBe('missions:cockpit.errors.notesTooLong');
  });
});
