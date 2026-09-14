import { z } from 'zod';

import { parseResponse } from './parseResponse';

const schema = z.object({ id: z.string() });

describe('parseResponse', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renvoie la donnée validée', () => {
    expect(parseResponse(schema, { id: 'a1', extra: true })).toEqual({ id: 'a1' });
  });

  it('lève une AppError contract et journalise l’écart', () => {
    expect(() => parseResponse(schema, { id: 1 })).toThrow(
      expect.objectContaining({ kind: 'contract' }),
    );
    expect(console.warn).toHaveBeenCalled();
  });
});
