import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import { fetchAccount } from '../api/authApi';
import { authKeys } from './authKeys';

/** Compte complet de l'utilisateur connecté (`GET /auth/me`). */
export function useAccount() {
  const api = useApiClient();
  return useQuery({ queryKey: authKeys.account(), queryFn: () => fetchAccount(api) });
}
