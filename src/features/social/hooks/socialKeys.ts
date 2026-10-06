/** Clés de cache de la feature `social`. */
export const socialKeys = {
  all: ['social'] as const,
  feed: () => [...socialKeys.all, 'feed'] as const,
  explore: () => [...socialKeys.all, 'explore'] as const,
  post: (postId: string) => [...socialKeys.all, 'posts', postId] as const,
  comments: (postId: string) => [...socialKeys.all, 'comments', postId] as const,
};
