import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('lève une erreur explicite pour une valeur non prévue', () => {
    expect(() => assertNever('inattendu' as never)).toThrow(
      'Valeur non prise en charge : "inattendu"',
    );
  });
});
