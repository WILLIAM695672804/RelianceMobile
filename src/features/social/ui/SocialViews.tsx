import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { MAX_FONT_SCALE } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import {
  Avatar,
  BackButton,
  Button,
  Card,
  ChoiceChip,
  Icon,
  ImagePlaceholder,
  Pill,
  Screen,
  Tabs,
  Text,
  TopBar,
  VerifiedMark,
  type IconName,
} from '@/shared/ui';

export interface FeedPost {
  id: string;
  author: string;
  role: string;
  verified: boolean;
  official?: boolean;
  when: string;
  title: string;
  body: string;
  /** Légendes des visuels (« avant », « après »). */
  media: readonly string[];
  likes: number;
  comments: number;
  liked: boolean;
}

export interface FeedComment {
  id: string;
  author: string;
  text: string;
  when: string;
}

function PostCard({
  post,
  expanded = false,
  onOpen,
  onLike,
}: {
  post: FeedPost;
  expanded?: boolean;
  onOpen?: () => void;
  onLike: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const body = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar name={post.author} size={40} color={post.official ? '#2b2a36' : undefined} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="labelStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {post.author}
            </Text>
            {post.verified ? <VerifiedMark size={14} /> : null}
            {post.official ? (
              <Pill label={t('social:feedView.official')} tone="primary" size="sm" />
            ) : null}
          </View>
          <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
            {post.role} · {post.when}
          </Text>
        </View>
      </View>
      <Text variant="bodyStrong" style={{ marginBottom: 4 }}>
        {post.title}
      </Text>
      <Text
        variant="label"
        tone="muted"
        numberOfLines={expanded ? undefined : 3}
        style={{ lineHeight: 20, fontFamily: theme.fontFamily.body }}
      >
        {post.body}
      </Text>
      {post.media.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          {post.media.slice(0, 2).map((caption, index) => (
            <View key={caption} style={{ flex: 1 }}>
              <ImagePlaceholder
                label={caption}
                height={130}
                radius={12}
                tone={index === 0 ? 'primary' : 'blue'}
              />
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
  return (
    <Card padding={14}>
      {onOpen ? (
        <Pressable accessibilityRole="button" accessibilityLabel={post.title} onPress={onOpen}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      <View
        style={{
          flexDirection: 'row',
          gap: 18,
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.divider,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(post.liked ? 'social:feedView.unlike' : 'social:feedView.like')}
          accessibilityState={{ selected: post.liked }}
          onPress={onLike}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
        >
          <Icon name="heart" size={18} tone={post.liked ? 'danger' : 'muted'} />
          <Text variant="label" tone={post.liked ? 'danger' : 'muted'}>
            {String(post.likes + (post.liked ? 1 : 0))}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="chat" size={18} tone="muted" />
          <Text variant="label" tone="muted">
            {String(post.comments)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export interface FeedViewProps {
  posts: readonly FeedPost[];
  liked: ReadonlySet<string>;
  onLike: (post: FeedPost) => void;
  onOpen: (post: FeedPost) => void;
  onCompose?: () => void;
  onBack?: () => void;
}

/** Fil de la communauté (maquette `FeedScreen`), présentation pure. */
export function FeedView({ posts, liked, onLike, onOpen, onCompose, onBack }: FeedViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tab, setTab] = useState('all');
  return (
    <Screen testID="fil">
      <TopBar title={t('social:feedView.title')} onBack={onBack} />
      <Tabs
        items={(['all', 'pros', 'community', 'tips'] as const).map((key) => ({
          key,
          label: t(`social:feedView.tabs.${key}`),
        }))}
        activeKey={tab}
        onSelect={setTab}
      />
      <View style={{ padding: 16, gap: 12 }}>
        {onCompose ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCompose}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Icon name="edit" size={18} tone="primary" />
            <Text variant="label" tone="muted">
              {t('social:feedView.compose')}
            </Text>
          </Pressable>
        ) : null}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={{ ...post, liked: liked.has(post.id) }}
            onOpen={() => onOpen(post)}
            onLike={() => onLike(post)}
          />
        ))}
      </View>
    </Screen>
  );
}

export interface PostViewProps {
  post: FeedPost;
  liked: boolean;
  comments: readonly FeedComment[];
  sending?: boolean;
  onBack: () => void;
  onLike: () => void;
  onComment: (text: string) => void;
}

/** Publication et commentaires (maquette `PostDetailScreen`), présentation pure. */
export function PostView({
  post,
  liked,
  comments,
  sending = false,
  onBack,
  onLike,
  onComment,
}: PostViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const send = () => {
    if (!draft.trim()) return;
    onComment(draft.trim());
    setDraft('');
  };
  return (
    <Screen
      testID="publication"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flex: 1,
              height: 44,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: 12,
              justifyContent: 'center',
            }}
          >
            {draft.length === 0 ? (
              <Text
                variant="body"
                tone="muted"
                style={{ position: 'absolute', left: 12, fontSize: 14 }}
              >
                {t('social:postView.placeholder')}
              </Text>
            ) : null}
            <TextInput
              accessibilityLabel={t('social:postView.comment')}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              style={{
                padding: 0,
                fontFamily: theme.fontFamily.body,
                fontSize: 14,
                color: theme.colors.text,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social:postView.send')}
            disabled={!draft.trim() || sending}
            onPress={send}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: draft.trim() ? 1 : 0.5,
            }}
          >
            <Icon name="send" size={18} tone="onPrimary" />
          </Pressable>
        </View>
      }
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <BackButton onPress={onBack} />
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <PostCard post={{ ...post, liked }} expanded onLike={onLike} />
        <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
          {t('social:postView.comments', { count: comments.length })}
        </Text>
        {comments.map((comment) => (
          <View key={comment.id} style={{ flexDirection: 'row', gap: 10 }}>
            <Avatar name={comment.author} size={32} />
            <View
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 14,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            >
              <Text variant="labelStrong">{comment.author}</Text>
              <Text variant="label" style={{ fontFamily: theme.fontFamily.body, marginTop: 2 }}>
                {comment.text}
              </Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 10, marginTop: 4 }}>
                {comment.when}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

export type PostKind = 'photo' | 'tip' | 'review' | 'question';
const KINDS: readonly { key: PostKind; icon: IconName }[] = [
  { key: 'photo', icon: 'image' },
  { key: 'tip', icon: 'sparkle' },
  { key: 'review', icon: 'star' },
  { key: 'question', icon: 'info' },
];

export interface ComposeViewProps {
  author: string;
  suggestedTags: readonly string[];
  publishing?: boolean;
  /** Choix de l'audience ; masqué lorsque le serveur publie toujours pour tous. */
  audiences?: boolean;
  onCancel: () => void;
  onPublish: (values: {
    kind: PostKind;
    title: string;
    body: string;
    tags: string[];
    audience: 'public' | 'pros';
  }) => void;
}

/** Rédaction d'une publication (maquette `CreatePostScreen`), présentation pure. */
export function ComposeView({
  author,
  suggestedTags,
  publishing = false,
  audiences = true,
  onCancel,
  onPublish,
}: ComposeViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [kind, setKind] = useState<PostKind>('photo');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [audience, setAudience] = useState<'public' | 'pros'>('public');
  const valid = body.trim().length > 0;

  return (
    <Screen testID="nouvelle-publication">
      <TopBar
        title={t('social:composer.title')}
        align="center"
        onBack={onCancel}
        trailing={
          <Button
            label={t('social:composer.publish')}
            size="sm"
            disabled={!valid}
            loading={publishing}
            onPress={() =>
              onPublish({ kind, title: title.trim(), body: body.trim(), tags, audience })
            }
          />
        }
      />
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar name={author} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="labelStrong">{author}</Text>
            {audiences ? (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <ChoiceChip
                  label={t('social:composer.public')}
                  selected={audience === 'public'}
                  onPress={() => setAudience('public')}
                />
                <ChoiceChip
                  label={t('social:composer.pros')}
                  selected={audience === 'pros'}
                  onPress={() => setAudience('pros')}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
          {KINDS.map((item) => {
            const selected = item.key === kind;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t(`social:composer.kinds.${item.key}`)}
                onPress={() => setKind(item.key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.tint.primary : theme.colors.surface,
                }}
              >
                <Icon name={item.icon} size={18} tone={selected ? 'primary' : 'muted'} />
                <Text
                  variant="caption"
                  numberOfLines={1}
                  tone={selected ? 'primary' : 'muted'}
                  style={{ fontSize: 11 }}
                >
                  {t(`social:composer.kinds.${item.key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          accessibilityLabel={t('social:composer.titleLabel')}
          placeholder={t('social:composer.titleLabel')}
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            fontFamily: theme.fontFamily.display,
            fontSize: 20,
            color: theme.colors.text,
            padding: 0,
          }}
        />
        <TextInput
          accessibilityLabel={t('social:composer.bodyLabel')}
          placeholder={t('social:composer.bodyPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            minHeight: 140,
            fontFamily: theme.fontFamily.body,
            fontSize: 15,
            lineHeight: 22,
            color: theme.colors.text,
            padding: 0,
          }}
        />
        <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
          {t('social:composer.tags')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {suggestedTags.map((tag) => (
            <ChoiceChip
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onPress={() =>
                setTags((current) =>
                  current.includes(tag)
                    ? current.filter((entry) => entry !== tag)
                    : [...current, tag],
                )
              }
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}
