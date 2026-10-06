import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useAddComment, useComments, usePost, useToggleLike } from '../hooks/useSocial';
import { commentFormSchema } from '../schemas/socialSchemas';
import { PostCard } from './PostCard';

export interface PostDetailScreenProps {
  postId: string;
}

/** Publication et ses commentaires. */
export function PostDetailScreen({ postId }: PostDetailScreenProps) {
  const { t } = useTranslation();
  const post = usePost(postId);
  const comments = useComments(postId);
  const toggleLike = useToggleLike();
  const addComment = useAddComment(postId);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { content: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setNotice(null);
    setError(null);
    try {
      await addComment.mutateAsync(values.content.trim());
      form.reset();
      setNotice(t('social:comments.added'));
    } catch {
      setError(t('social:comments.failed'));
    }
  });

  const renderComments = () => {
    if (comments.isPending) return <StateView status="loading" />;
    if (comments.isError) {
      return (
        <StateView status="error" error={comments.error} onRetry={() => void comments.refetch()} />
      );
    }
    if (comments.data.length === 0) {
      return <StateView status="empty" message={t('social:comments.empty')} />;
    }
    return comments.data.map((comment) => (
      <Card key={comment.id}>
        <Avatar
          name={comment.author?.name ?? t('social:feed.unknownAuthor')}
          uri={comment.author?.avatar_url}
          size={32}
        />
        <Text variant="caption" tone="primary">
          {comment.author?.name ?? t('social:feed.unknownAuthor')}
        </Text>
        <Text>{comment.content}</Text>
        {comment.created_at ? (
          <Text variant="caption" tone="muted">
            {t('social:feed.publishedAt', { date: formatDate(comment.created_at) })}
          </Text>
        ) : null}
      </Card>
    ));
  };

  return (
    <Screen scroll onRefresh={() => void comments.refetch()} refreshing={comments.isRefetching}>
      {post.isPending ? <StateView status="loading" /> : null}
      {post.isError ? (
        <StateView status="error" error={post.error} onRetry={() => void post.refetch()} />
      ) : null}
      {post.isSuccess ? (
        <PostCard
          post={post.data}
          onToggleLike={(id) => void toggleLike.mutateAsync(id)}
          pending={toggleLike.isPending}
        />
      ) : null}
      <Text variant="subtitle">{t('social:comments.title')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderComments()}
      <FormTextField
        control={form.control}
        name="content"
        label={t('social:comments.content')}
        multiline
      />
      <Button
        label={t('social:comments.submit')}
        onPress={() => void submit()}
        loading={addComment.isPending}
      />
    </Screen>
  );
}
