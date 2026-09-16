/** Clés de cache de la feature `kyc`. */
export const kycKeys = {
  all: ['kyc'] as const,
  mine: () => [...kycKeys.all, 'mine'] as const,
};
