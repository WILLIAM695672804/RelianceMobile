import type { Intervention } from '../schemas/interventionSchemas';
import { interventionForJob, interventionForRequest } from './pickIntervention';

const make = (overrides: Partial<Intervention>): Intervention =>
  ({
    id: 'i1',
    job_id: 'j1',
    request_id: 'r1',
    status: 'planned',
    ...overrides,
  }) as Intervention;

describe('pickIntervention', () => {
  it('ne renvoie rien sans intervention attachée', () => {
    expect(interventionForJob([], 'j1')).toBeNull();
    expect(interventionForRequest([make({ request_id: 'r2' })], 'r1')).toBeNull();
  });

  it('retient l’intervention de la mission', () => {
    const wanted = make({ id: 'i2', job_id: 'j2' });

    expect(interventionForJob([make({}), wanted], 'j2')?.id).toBe('i2');
  });

  it('retient la plus récente d’une demande', () => {
    const older = make({ id: 'i1', completed_at: '2026-10-01T10:00:00Z' });
    const newer = make({ id: 'i2', completed_at: '2026-10-15T10:00:00Z' });

    expect(interventionForRequest([older, newer], 'r1')?.id).toBe('i2');
    expect(interventionForRequest([newer, older], 'r1')?.id).toBe('i2');
  });

  it('classe une intervention sans date après celles qui en portent', () => {
    const dated = make({ id: 'i1', started_at: '2026-10-01T10:00:00Z' });
    const undated = make({ id: 'i2' });

    expect(interventionForRequest([undated, dated], 'r1')?.id).toBe('i1');
  });
});
