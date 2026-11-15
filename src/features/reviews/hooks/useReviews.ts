import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  fetchBadgeCatalog,
  fetchMyReviews,
  fetchReputation,
  fetchTechnicianReviews,
  fetchUserBadges,
  submitReview,
} from '../api/reviewsApi';
import type { ReviewPayload } from '../schemas/reviewSchemas';
import { reviewsKeys } from './reviewsKeys';

export function useTechnicianReviews(technicianId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: reviewsKeys.technician(technicianId),
    queryFn: () => fetchTechnicianReviews(api, technicianId),
  });
}

export function useMyReviews() {
  const api = useApiClient();
  return useQuery({ queryKey: reviewsKeys.mine(), queryFn: () => fetchMyReviews(api) });
}

export function useUserBadges(userId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: reviewsKeys.badges(userId),
    queryFn: () => fetchUserBadges(api, userId),
  });
}

export function useReputation(userId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: reviewsKeys.reputation(userId),
    queryFn: () => fetchReputation(api, userId),
  });
}

export function useBadgeCatalog() {
  const api = useApiClient();
  return useQuery({ queryKey: reviewsKeys.catalog(), queryFn: () => fetchBadgeCatalog(api) });
}

export function useSubmitReview() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewPayload) => submitReview(api, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewsKeys.all }),
  });
}
