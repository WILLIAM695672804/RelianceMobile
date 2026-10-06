import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  checkFollow,
  fetchFollowCounts,
  fetchSuggestions,
  followUser,
  unfollowUser,
} from '../api/followsApi';
import { socialKeys } from './socialKeys';

export function useFollowStatus(userId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: socialKeys.follow(userId),
    queryFn: () => checkFollow(api, userId),
  });
}

export function useFollowCounts(userId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: socialKeys.followCounts(userId),
    queryFn: () => fetchFollowCounts(api, userId),
  });
}

export function useSuggestions() {
  const api = useApiClient();
  return useQuery({
    queryKey: socialKeys.suggestions(),
    queryFn: () => fetchSuggestions(api),
  });
}

/** Toute bascule recharge le fil, les suggestions et les compteurs. */
function useFollowInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: socialKeys.all });
}

export function useFollowUser() {
  const api = useApiClient();
  const invalidate = useFollowInvalidation();
  return useMutation({
    mutationFn: (userId: string) => followUser(api, userId),
    onSuccess: invalidate,
  });
}

export function useUnfollowUser() {
  const api = useApiClient();
  const invalidate = useFollowInvalidation();
  return useMutation({
    mutationFn: (userId: string) => unfollowUser(api, userId),
    onSuccess: invalidate,
  });
}
