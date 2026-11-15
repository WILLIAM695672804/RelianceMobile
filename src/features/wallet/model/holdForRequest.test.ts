import type { Hold } from '../schemas/holdSchemas';
import { holdForRequest } from './holdForRequest';

const hold = (overrides: Partial<Hold>): Hold =>
  ({ id: 'h1', amount: 1000, status: 'held', reason: null, ...overrides }) as Hold;

describe('holdForRequest', () => {
  it('ne renvoie rien sans gel actif', () => {
    expect(holdForRequest([], 'r1')).toBeNull();
    expect(holdForRequest([hold({ status: 'captured' })], 'r1')).toBeNull();
  });

  it('retient le gel dont le motif cite la demande', () => {
    const wanted = hold({ id: 'h2', reason: 'Séquestre de la demande r1' });

    expect(holdForRequest([hold({}), wanted], 'r1')?.id).toBe('h2');
  });

  it('retient le gel actif le plus ancien à défaut de motif', () => {
    const oldest = hold({ id: 'h1' });
    const newest = hold({ id: 'h2' });

    expect(holdForRequest([newest, oldest], 'r1')?.id).toBe('h1');
  });

  it('écarte les gels déjà capturés ou libérés', () => {
    const active = hold({ id: 'h3' });

    expect(
      holdForRequest(
        [hold({ id: 'h1', status: 'captured' }), hold({ id: 'h2', status: 'released' }), active],
        'r1',
      )?.id,
    ).toBe('h3');
  });
});
