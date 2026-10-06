import { useTranslation } from 'react-i18next';

import { Avatar, Button, Card, Text } from '@/shared/components';
import { formatDate } from '@/shared/format';
import { StyleSheet, View } from 'react-native';

import type { Post } from '../schemas/socialSchemas';

export interface PostCardProps {
  post: Post;
  /** Bascule de la mention « j'aime » ; absente, aucun bouton n'est présenté. */
  onToggleLike?: (postId: string) => void;
  /** Ouverture de la publication et de ses commentaires. */
  onOpen?: (postId: string) => void;
  pending?: boolean;
}

/** Publication du fil : auteur, contenu, compteurs et actions. */
export function PostCard({ post, onToggleLike, onOpen, pending }: PostCardProps) {
  const { t } = useTranslation();
  const author = post.author?.name ?? t('social:feed.unknownAuthor');
  const likeAction = t(post.is_liked ? 'social:feed.liked' : 'social:feed.like');

  return (
    <Card>
      <View style={styles.header}>
        <Avatar name={author} uri={post.author?.avatar_url} size={40} />
        <View style={styles.identity}>
          <Text variant="subtitle">{author}</Text>
          {post.created_at ? (
            <Text variant="caption" tone="muted">
              {t('social:feed.publishedAt', { date: formatDate(post.created_at) })}
            </Text>
          ) : null}
        </View>
      </View>
      {post.content ? <Text>{post.content}</Text> : null}
      <Text variant="caption" tone="muted">
        {t('social:feed.likes', { count: post.likes_count })}
      </Text>
      <Text variant="caption" tone="muted">
        {t('social:feed.comments', { count: post.comments_count })}
      </Text>
      {onToggleLike ? (
        <Button
          label={likeAction}
          accessibilityLabel={t('social:feed.likeNamed', { action: likeAction, name: author })}
          onPress={() => onToggleLike(post.id)}
          disabled={pending}
          variant={post.is_liked ? 'primary' : 'secondary'}
        />
      ) : null}
      {onOpen ? (
        <Button
          label={t('social:feed.open')}
          accessibilityLabel={t('social:feed.openNamed', { name: author })}
          onPress={() => onOpen(post.id)}
          variant="ghost"
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 2 },
});
