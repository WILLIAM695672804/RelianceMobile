import { AxiosError } from 'axios';

import { AppError } from '@/core/errors';

import { createQueryClient, retryDelay, shouldRetryQuery } from './queryClient';

describe('shouldRetryQuery', () => {
  it.each([
    [0, 'network', true],
    [2, 'timeout', true],
    [2, 'server', true],
    [3, 'network', false],
    [0, 'validation', false],
    [0, 'unauthenticated', false],
    [0, 'notFound', false],
  ] as const)('après %i échec(s) de type %s → %s', (failureCount, kind, expected) => {
    expect(shouldRetryQuery(failureCount, new AppError({ kind }))).toBe(expected);
  });

  it('normalise une erreur brute avant décision', () => {
    expect(shouldRetryQuery(0, new AxiosError('Network Error', AxiosError.ERR_NETWORK))).toBe(true);
  });
});

describe('retryDelay', () => {
  it('double le délai à chaque tentative, plafonné à 30 s', () => {
    expect(retryDelay(0)).toBe(1_000);
    expect(retryDelay(1)).toBe(2_000);
    expect(retryDelay(2)).toBe(4_000);
    expect(retryDelay(10)).toBe(30_000);
  });
});

describe('createQueryClient', () => {
  it('applique la politique de relance et de fraîcheur', () => {
    const options = createQueryClient().getDefaultOptions();
    expect(options.queries).toMatchObject({
      retry: shouldRetryQuery,
      retryDelay,
      staleTime: 30_000,
    });
    expect(options.queries?.gcTime).toBe(24 * 60 * 60 * 1000);
    expect(options.mutations?.retry).toBe(false);
  });
});
