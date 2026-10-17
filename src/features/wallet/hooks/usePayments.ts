import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { confirmPayment, fetchPayment } from '../api/paymentsApi';
import { walletKeys } from './walletKeys';

export function usePayment(id: string) {
  const api = useApiClient();
  return useQuery({ queryKey: walletKeys.payment(id), queryFn: () => fetchPayment(api, id) });
}

export function useConfirmPayment(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmPayment(api, id),
    // La confirmation crédite le portefeuille : solde et mouvements sont rechargés.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}
