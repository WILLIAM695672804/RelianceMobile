import { expiryState, isActionable } from './proposalExpiry';
import { MAX_PROPOSED_TECHNICIANS, rankTechnicians } from './ranking';

const NOW = Date.parse('2026-09-16T12:00:00Z');

describe('proposalExpiry', () => {
  it('calcule le délai restant arrondi à la minute supérieure', () => {
    expect(expiryState('2026-09-16T14:30:20Z', NOW)).toEqual({
      status: 'active',
      hours: 2,
      minutes: 31,
    });
  });

  it('signale une proposition expirée ou une échéance illisible', () => {
    expect(expiryState('2026-09-16T11:59:59Z', NOW)).toEqual({ status: 'expired' });
    expect(expiryState(null, NOW)).toBeNull();
    expect(expiryState('illisible', NOW)).toBeNull();
  });

  it('isActionable ne retient que les propositions en attente non expirées', () => {
    expect(isActionable({ status: 'pending', expires_at: '2026-09-16T13:00:00Z' }, NOW)).toBe(true);
    expect(isActionable({ status: 'pending', expires_at: null }, NOW)).toBe(true);
    expect(isActionable({ status: 'pending', expires_at: '2026-09-16T11:00:00Z' }, NOW)).toBe(
      false,
    );
    expect(isActionable({ status: 'accepted', expires_at: '2026-09-16T13:00:00Z' }, NOW)).toBe(
      false,
    );
  });
});

describe('rankTechnicians', () => {
  it('trie par score décroissant et retient cinq techniciens au plus (RG-MAT-02, RG-MAT-03)', () => {
    const ranked = rankTechnicians(
      [40, 90, 65, 10, 75, 88].map((score, index) => ({ id: `t${index}`, match_score: score })),
    );

    expect(MAX_PROPOSED_TECHNICIANS).toBe(5);
    expect(ranked.map((technician) => technician.match_score)).toEqual([90, 88, 75, 65, 40]);
  });
});
