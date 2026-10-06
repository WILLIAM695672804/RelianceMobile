import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { useSession } from '@/core/session';

import {
  fetchTransactions,
  fetchWallet,
  rechargeWallet,
  requestWithdrawal,
} from '../api/walletApi';
import type { PaymentPayload } from '../schemas/walletSchemas';
import { walletKeys } from './walletKeys';

export function useWallet() {
  const api = useApiClient();
  return useQuery({ queryKey: walletKeys.wallet(), queryFn: () => fetchWallet(api) });
}

export function useWalletTransactions() {
  const api = useApiClient();
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: () => fetchTransactions(api),
  });
}

/** Toute demande de paiement recharge le portefeuille et son historique. */
function useWalletInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: walletKeys.all });
}

export function useRechargeWallet() {
  const api = useApiClient();
  const invalidate = useWalletInvalidation();
  return useMutation({
    mutationFn: (payload: PaymentPayload) => rechargeWallet(api, payload),
    onSuccess: invalidate,
  });
}

export function useRequestWithdrawal() {
  const api = useApiClient();
  const invalidate = useWalletInvalidation();
  return useMutation({
    mutationFn: (payload: PaymentPayload) => requestWithdrawal(api, payload),
    onSuccess: invalidate,
  });
}

/** Canal `wallet.{userId}` : solde, gels et règlements. */
export function useWalletSync() {
  const userId = useSession((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  const channel = userId ? channels.wallet(userId) : null;
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: walletKeys.all });
  };

  useChannelEvent(channel, 'BalanceUpdated', invalidate);
  useChannelEvent(channel, 'HoldCaptured', invalidate);
  useChannelEvent(channel, 'HoldReleased', invalidate);
  useChannelEvent(channel, 'PaymentSettled', invalidate);
}
