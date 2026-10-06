import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  addComment,
  createPost,
  fetchComments,
  fetchExplore,
  fetchFeed,
  fetchPost,
  toggleLike,
} from '../api/socialApi';
import { socialKeys } from './socialKeys';

export function useFeed() {
  const api = useApiClient();
  return useQuery({ queryKey: socialKeys.feed(), queryFn: () => fetchFeed(api) });
}

export function useExplore() {
  const api = useApiClient();
  return useQuery({ queryKey: socialKeys.explore(), queryFn: () => fetchExplore(api) });
}

export function usePost(postId: string) {
  const api = useApiClient();
  return useQuery({ queryKey: socialKeys.post(postId), queryFn: () => fetchPost(api, postId) });
}

export function useComments(postId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: socialKeys.comments(postId),
    queryFn: () => fetchComments(api, postId),
  });
}

/** Toute écriture recharge les fils, la publication et ses commentaires. */
function useSocialInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: socialKeys.all });
}

export function useCreatePost() {
  const api = useApiClient();
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (content: string) => createPost(api, content),
    onSuccess: invalidate,
  });
}

export function useToggleLike() {
  const api = useApiClient();
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (postId: string) => toggleLike(api, postId),
    onSuccess: invalidate,
  });
}

export function useAddComment(postId: string) {
  const api = useApiClient();
  const invalidate = useSocialInvalidation();
  return useMutation({
    mutationFn: (content: string) => addComment(api, postId, content),
    onSuccess: invalidate,
  });
}
