import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { MAX_FONT_SCALE } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  Avatar,
  BackButton,
  Button,
  ChoiceChip,
  EmptyState,
  Icon,
  Screen,
  Text,
} from '@/shared/ui';

export type ChatItem =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'message'; id: string; mine: boolean; text: string }
  | {
      kind: 'quote';
      id: string;
      title: string;
      total: number;
      /** Fournis, le devis peut être accepté ou refusé depuis la conversation. */
      actionable: boolean;
    };

export interface ChatViewProps {
  contact: { name: string; color?: string; online: boolean; context: string };
  items: readonly ChatItem[];
  sending?: boolean;
  onBack: () => void;
  onCall?: () => void;
  onSend: (text: string) => void;
  onAttach?: () => void;
  onAcceptQuote?: (id: string) => void;
  onRejectQuote?: (id: string) => void;
}

/** Conversation (maquette `ChatScreen`), présentation pure. */
export function ChatView(props: ChatViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    props.onSend(text);
    setDraft('');
  };

  return (
    <Screen scroll={false} testID="conversation">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <BackButton onPress={props.onBack} />
        <Avatar name={props.contact.name} color={props.contact.color} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="labelStrong" numberOfLines={1} accessibilityRole="header">
            {props.contact.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {props.contact.online ? (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.success,
                }}
              />
            ) : null}
            <Text
              variant="caption"
              tone={props.contact.online ? 'success' : 'muted'}
              numberOfLines={1}
              style={{ fontSize: 11 }}
            >
              {props.contact.online ? `${t('chat:live.online')} · ` : ''}
              {props.contact.context}
            </Text>
          </View>
        </View>
        {props.onCall ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat:live.call', { name: props.contact.name })}
            onPress={props.onCall}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="phone" size={18} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 8 }}
      >
        {props.items.map((item) => {
          if (item.kind === 'day') {
            return (
              <Text
                key={item.id}
                variant="caption"
                tone="muted"
                align="center"
                style={{ fontSize: 11, marginBottom: 8 }}
              >
                {item.label}
              </Text>
            );
          }
          if (item.kind === 'quote') {
            return (
              <View
                key={item.id}
                style={{
                  alignSelf: 'center',
                  width: '86%',
                  marginVertical: 8,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}
                >
                  <Icon name="file" size={14} tone="primary" />
                  <Text variant="eyebrow" tone="primary" style={{ letterSpacing: 1 }}>
                    {t('chat:live.quoteSent')}
                  </Text>
                </View>
                <Text variant="bodyStrong" style={{ fontSize: 14, marginBottom: 4 }}>
                  {item.title}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: item.actionable ? 10 : 0,
                  }}
                >
                  <Text variant="label" tone="muted">
                    {t('chat:live.total')}
                  </Text>
                  <Text variant="labelStrong" style={{ fontFamily: theme.fontFamily.display }}>
                    {formatAmount(item.total)}
                  </Text>
                </View>
                {item.actionable ? (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label={t('chat:live.reject')}
                        variant="ghost"
                        size="sm"
                        full
                        onPress={() => props.onRejectQuote?.(item.id)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label={t('chat:live.accept')}
                        size="sm"
                        full
                        onPress={() => props.onAcceptQuote?.(item.id)}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            );
          }
          return (
            <View
              key={item.id}
              accessible
              accessibilityLabel={`${item.mine ? t('chat:live.me') : props.contact.name} : ${item.text}`}
              style={{
                alignSelf: item.mine ? 'flex-end' : 'flex-start',
                maxWidth: '78%',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                borderBottomRightRadius: item.mine ? 4 : 16,
                borderBottomLeftRadius: item.mine ? 16 : 4,
                borderWidth: item.mine ? 0 : 1,
                borderColor: theme.colors.border,
                backgroundColor: item.mine ? theme.colors.primary : theme.colors.surface,
              }}
            >
              <Text
                variant="body"
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: item.mine ? theme.colors.onPrimary : theme.colors.text,
                }}
              >
                {item.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 14,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        {props.onAttach ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat:live.attach')}
            onPress={props.onAttach}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={18} />
          </Pressable>
        ) : null}
        <View
          style={{
            flex: 1,
            height: 44,
            paddingHorizontal: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
          }}
        >
          {draft.length === 0 ? (
            <Text
              variant="body"
              tone="muted"
              style={{ position: 'absolute', left: 12, fontSize: 14 }}
            >
              {t('chat:live.placeholder')}
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel={t('chat:live.message')}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            returnKeyType="send"
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
          accessibilityLabel={t('chat:live.send')}
          accessibilityState={{ disabled: draft.trim().length === 0 || props.sending }}
          disabled={draft.trim().length === 0 || props.sending}
          onPress={send}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: draft.trim().length === 0 ? 0.5 : 1,
          }}
        >
          <Icon name="send" size={18} tone="onPrimary" />
        </Pressable>
      </View>
    </Screen>
  );
}

export interface ConversationSummary {
  id: string;
  name: string;
  color?: string;
  last: string;
  time: string;
  unread: number;
  online: boolean;
  archived: boolean;
}

export interface InboxViewProps {
  conversations: readonly ConversationSummary[];
  onOpen: (conversation: ConversationSummary) => void;
  onNew?: () => void;
  /** Fourni, l'écran est ouvert hors des onglets : bouton retour, sans barre d'onglets. */
  onBack?: () => void;
}

type Filter = 'all' | 'active' | 'archive';

/** Boîte de réception (maquette `InboxScreen`), présentation pure. */
export function InboxView({ conversations, onOpen, onNew, onBack }: InboxViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = conversations.filter((item) =>
    filter === 'all'
      ? !item.archived
      : filter === 'active'
        ? item.unread > 0 || item.online
        : item.archived,
  );

  return (
    <Screen withTabBar={!onBack} testID="messages">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        {onBack ? <BackButton onPress={onBack} /> : null}
        <Text
          variant="display"
          accessibilityRole="header"
          style={{ flex: 1, fontSize: 28, lineHeight: 32 }}
        >
          {t('chat:inbox.title')}
        </Text>
        {onNew ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat:inbox.new')}
            onPress={onNew}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="edit" size={18} />
          </Pressable>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 12 }}>
        {(['all', 'active', 'archive'] as const).map((key) => (
          <ChoiceChip
            key={key}
            label={t(`chat:inbox.filters.${key}`)}
            selected={filter === key}
            onPress={() => setFilter(key)}
          />
        ))}
      </View>
      {visible.length === 0 ? (
        <EmptyState
          icon="chat"
          tone="neutral"
          title={t('chat:inbox.emptyTitle')}
          message={t('chat:inbox.emptyBody')}
        />
      ) : (
        visible.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityHint={item.last}
            onPress={() => onOpen(item)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
            })}
          >
            <View>
              <Avatar name={item.name} color={item.color} size={48} />
              {item.online ? (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: theme.colors.background,
                    backgroundColor: theme.colors.success,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text
                  variant="labelStrong"
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontFamily: item.unread
                      ? theme.fontFamily.bodyBold
                      : theme.fontFamily.bodySemiBold,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  variant="caption"
                  tone={item.unread ? 'primary' : 'muted'}
                  style={{ fontSize: 11 }}
                >
                  {item.time}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Text
                  variant="caption"
                  tone="muted"
                  numberOfLines={1}
                  style={{ flex: 1, fontFamily: theme.fontFamily.body }}
                >
                  {item.last}
                </Text>
                {item.unread > 0 ? (
                  <View
                    style={{
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 6,
                      borderRadius: 10,
                      backgroundColor: theme.colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.onPrimary,
                        fontSize: 11,
                        lineHeight: 14,
                        fontFamily: theme.fontFamily.bodyBold,
                      }}
                    >
                      {String(item.unread)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
