import {
  isJobClosed,
  JOB_TIMELINE,
  JOB_STATUS_TONES,
  nextPhaseStatus,
  nextStatusOf,
  timelineIndexOf,
} from './jobStatus';

describe('modèle des statuts de mission', () => {
  it('propose la transition suivante du technicien', () => {
    expect(nextStatusOf('pending')).toBe('en_route');
    expect(nextStatusOf('en_route')).toBe('arrived');
    expect(nextStatusOf('arrived')).toBe('in_progress');
    expect(nextStatusOf('in_progress')).toBe('completed');
    expect(nextStatusOf('completed')).toBeNull();
    expect(nextStatusOf('cancelled')).toBeNull();
    expect(nextStatusOf('inconnu')).toBeNull();
  });

  it('situe le statut dans la frise de suivi', () => {
    expect(JOB_TIMELINE).toEqual(['pending', 'en_route', 'arrived', 'in_progress', 'completed']);
    expect(timelineIndexOf('arrived')).toBe(2);
    expect(timelineIndexOf('cancelled')).toBe(-1);
  });

  it('distingue les missions closes et donne un ton par statut', () => {
    expect(isJobClosed('completed')).toBe(true);
    expect(isJobClosed('cancelled')).toBe(true);
    expect(isJobClosed('in_progress')).toBe(false);
    expect(JOB_STATUS_TONES.completed).toBe('success');
    expect(JOB_STATUS_TONES.cancelled).toBe('danger');
  });

  it('fait cycler le statut d’une phase', () => {
    expect(nextPhaseStatus('pending')).toBe('in_progress');
    expect(nextPhaseStatus('in_progress')).toBe('completed');
    expect(nextPhaseStatus('completed')).toBe('pending');
  });
});
