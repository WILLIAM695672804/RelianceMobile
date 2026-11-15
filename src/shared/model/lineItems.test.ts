import { totalsOf } from './lineItems';

describe('totalsOf', () => {
  it('additionne les lignes et applique les frais arrondis', () => {
    const lines = [
      { label: 'Joint torique 32 mm', quantity: 1, unitPrice: 500 },
      { label: 'Main-d’œuvre', quantity: 1, unitPrice: 6000 },
      { label: 'Déplacement', quantity: 2, unitPrice: 500 },
    ];
    expect(totalsOf(lines, 0.05)).toEqual({ subtotal: 7500, fee: 375, total: 7875 });
    expect(totalsOf(lines)).toEqual({ subtotal: 7500, fee: 0, total: 7500 });
    expect(totalsOf([])).toEqual({ subtotal: 0, fee: 0, total: 0 });
  });
});
