/** Clés de cache de la feature `wallet`. */
export const walletKeys = {
  all: ['wallet'] as const,
  wallet: () => [...walletKeys.all, 'detail'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
  holds: () => [...walletKeys.all, 'holds'] as const,
  payment: (id: string) => [...walletKeys.all, 'payment', id] as const,
};
