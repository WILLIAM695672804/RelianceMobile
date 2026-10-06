import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';

import { useCreatePost, useExplore, useFeed, useToggleLike } from '../hooks/useSocial';
import { postFormSchema } from '../schemas/socialSchemas';
import { PostCard } from './PostCard';
import { SuggestionsCard } from './SuggestionsCard';

type Tab = 'mine' | 'explore';

export interface FeedScreenProps {
  /** Ouverture d'une publication et de ses commentaires. */
  onOpen: (postId: string) => void;
}

/** Fil social : publications suivies, fil global, publication et mentions « j'aime ». */
export function FeedScreen({ onOpen }: FeedScreenProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('mine');
  const feed = useFeed();
  const explore = useExplore();
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(postFormSchema), defaultValues: { content: '' } });

  const active = tab === 'mine' ? feed : explore;

  const publish = form.handleSubmit(async (values) => {
    setNotice(null);
    setError(null);
    try {
      await createPost.mutateAsync(values.content.trim());
      form.reset();
      setNotice(t('social:compose.published'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  const like = async (postId: string) => {
    setNotice(null);
    setError(null);
    try {
      await toggleLike.mutateAsync(postId);
    } catch {
      setError(t('social:feed.actionFailed'));
    }
  };

  const renderPosts = () => {
    if (active.isPending) return <StateView status="loading" />;
    if (active.isError) {
      return (
        <StateView status="error" error={active.error} onRetry={() => void active.refetch()} />
      );
    }
    if (active.data.length === 0) {
      return (
        <StateView
          status="empty"
          message={t(tab === 'mine' ? 'social:feed.emptyMine' : 'social:feed.empty')}
        />
      );
    }
    return active.data.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        onToggleLike={(postId) => void like(postId)}
        onOpen={onOpen}
        pending={toggleLike.isPending}
      />
    ));
  };

  return (
    <Screen scroll onRefresh={() => void active.refetch()} refreshing={active.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('social:feed.title')}
      </Text>
      <View style={styles.tabs}>
        <Button
          label={t('social:feed.mine')}
          onPress={() => setTab('mine')}
          variant={tab === 'mine' ? 'primary' : 'ghost'}
        />
        <Button
          label={t('social:feed.explore')}
          onPress={() => setTab('explore')}
          variant={tab === 'explore' ? 'primary' : 'ghost'}
        />
      </View>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <Card>
        <Text variant="subtitle">{t('social:compose.title')}</Text>
        <FormTextField
          control={form.control}
          name="content"
          label={t('social:compose.content')}
          multiline
        />
        <Button
          label={t('social:compose.submit')}
          onPress={() => void publish()}
          loading={createPost.isPending}
        />
      </Card>
      <SuggestionsCard />
      {renderPosts()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
});
