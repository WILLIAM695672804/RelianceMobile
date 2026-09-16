import { countOpenRequests, isOpenRequest, stageOf, STAGE_TONES } from './requestStage';

describe('requestStage', () => {
  it('dérive l’étape du statut réel du serveur', () => {
    expect(stageOf('new')).toBe('toMatch');
    expect(stageOf('analyzed')).toBe('toMatch');
    expect(stageOf('quoted')).toBe('awaitingTechnician');
    expect(stageOf('assigned')).toBe('assigned');
    expect(stageOf('completed')).toBe('closed');
    expect(stageOf('cancelled')).toBe('closed');
    expect(stageOf('disputed')).toBe('unknown');
  });

  it('compte les demandes ouvertes', () => {
    expect(isOpenRequest('quoted')).toBe(true);
    expect(isOpenRequest('completed')).toBe(false);
    expect(isOpenRequest('disputed')).toBe(false);
    expect(
      countOpenRequests([{ status: 'new' }, { status: 'assigned' }, { status: 'cancelled' }]),
    ).toBe(2);
  });

  it('associe une tonalité de pastille à chaque étape', () => {
    expect(STAGE_TONES.assigned).toBe('success');
    expect(STAGE_TONES.awaitingTechnician).toBe('warning');
  });
});
