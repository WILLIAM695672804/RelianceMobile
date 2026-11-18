import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { formatDate } from '@/shared/format';
import { QueryGate, useToast } from '@/shared/ui';

import {
  useAddComment,
  useComments,
  useCreatePost,
  useExplore,
  useFeed,
  usePost,
  useToggleLike,
} from '../hooks/useSocial';
import type { Comment, Post } from '../schemas/socialSchemas';
import { ComposeView, FeedView, PostView, type FeedPost, type PostKind } from '../ui/SocialViews';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Étiquettes proposées à la rédaction. */
const SUGGESTED_TAGS = ['plomberie', 'electricite', 'climatisation', 'astuce', 'avantapres'];

/**
 * Publication du serveur (texte seul) au format de la carte : la première ligne fait office
 * de titre (et d'intitulé accessible), le reste de corps.
 */
export function toFeedPost(post: Post, t: Translate): FeedPost {
  const [first = '', ...rest] = (post.content ?? '').split('\n');
  const body = rest.join('\n').trim();
  return {
    id: post.id,
    author: post.author?.name ?? t('social:feed.unknownAuthor'),
    role: '',
    verified: Boolean(post.author?.is_verified),
    when: post.created_at ? formatDate(post.created_at) : '',
    title: first.trim(),
    body,
    media: [],
    likes: post.likes_count,
    comments: post.comments_count,
    liked: post.is_liked,
  };
}

/** Texte publié : type et titre en tête, corps, puis mots-clés. */
export function toPostContent(
  values: { kind: PostKind; title: string; body: string; tags: string[] },
  kindLabel: string,
): string {
  const heading = [kindLabel, values.title.trim()].filter(Boolean).join(' · ');
  const tags = values.tags.map((tag) => `#${tag}`).join(' ');
  return [heading, values.body.trim(), tags].filter(Boolean).join('\n\n');
}

function useLike() {
  const { t } = useTranslation();
  const toast = useToast();
  const toggle = useToggleLike();
  return (postId: string) =>
    toggle.mutate(postId, {
      onError: (error) =>
        toast.show({ kind: 'error', title: describeError(normalizeError(error), t) }),
    });
}

export interface FeedContainerProps {
  onOpen: (postId: string) => void;
  onCompose: () => void;
  onBack?: () => void;
}

/** Fil : publications des comptes suivis, à défaut le fil global. */
export function FeedContainer({ onOpen, onCompose, onBack }: FeedContainerProps) {
  const { t } = useTranslation();
  const feed = useFeed();
  const explore = useExplore();
  const like = useLike();

  return (
    <QueryGate queries={[feed]}>
      {() => {
        const source = (feed.data ?? []).length > 0 ? feed.data! : (explore.data ?? []);
        const posts = source.map((post) => toFeedPost(post, t));
        return (
          <FeedView
            posts={posts}
            liked={new Set(posts.filter((post) => post.liked).map((post) => post.id))}
            onLike={(post) => like(post.id)}
            onOpen={(post) => onOpen(post.id)}
            onCompose={onCompose}
            onBack={onBack}
          />
        );
      }}
    </QueryGate>
  );
}

export function toFeedComment(comment: Comment, t: Translate) {
  return {
    id: comment.id,
    author: comment.author?.name ?? t('social:feed.unknownAuthor'),
    text: comment.content,
    when: comment.created_at ? formatDate(comment.created_at) : '',
  };
}

export interface PostContainerProps {
  postId: string;
  onBack: () => void;
}

/** Publication : mention « j'aime » et commentaires. */
export function PostContainer({ postId, onBack }: PostContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const post = usePost(postId);
  const comments = useComments(postId);
  const comment = useAddComment(postId);
  const like = useLike();

  const send = (text: string) =>
    comment.mutate(text, {
      onError: (error) =>
        toast.show({ kind: 'error', title: describeError(normalizeError(error), t) }),
    });

  return (
    <QueryGate queries={[post]}>
      {() => {
        const shown = toFeedPost(post.data!, t);
        return (
          <PostView
            post={shown}
            liked={shown.liked}
            comments={(comments.data ?? []).map((item) => toFeedComment(item, t))}
            sending={comment.isPending}
            onBack={onBack}
            onLike={() => like(postId)}
            onComment={send}
          />
        );
      }}
    </QueryGate>
  );
}

export interface ComposeContainerProps {
  onDone: () => void;
}

/** Rédaction : la publication est visible de tous (le serveur ne gère pas d'audience). */
export function ComposeContainer({ onDone }: ComposeContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const author = useSession((state) => state.user?.name ?? '');
  const create = useCreatePost();

  return (
    <ComposeView
      author={author}
      suggestedTags={SUGGESTED_TAGS}
      publishing={create.isPending}
      audiences={false}
      onCancel={onDone}
      onPublish={(values) =>
        create.mutate(toPostContent(values, t(`social:composer.kinds.${values.kind}`)), {
          onSuccess: onDone,
          onError: (error) =>
            toast.show({ kind: 'error', title: describeError(normalizeError(error), t) }),
        })
      }
    />
  );
}
