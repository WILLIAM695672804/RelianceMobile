import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';
import {
  EmptyState,
  Icon,
  Screen,
  Tabs,
  Text,
  TextAction,
  TopBar,
  type IconName,
} from '@/shared/ui';

import {
  categoryOf,
  elapsedOf,
  groupByPeriod,
  type NotificationCategory,
} from '../model/notificationGroups';
import type { AppNotification } from '../schemas/notificationSchemas';

const ICON_BY_CATEGORY: Record<NotificationCategory, IconName> = {
  mission: 'bolt',
  message: 'chat',
  finance: 'wallet',
  account: 'shield',
};

type TabKey = 'all' | Exclude<NotificationCategory, 'account'>;
const TAB_KEYS: TabKey[] = ['all', 'mission', 'message', 'finance'];

export interface NotificationsViewProps {
  status: 'loading' | 'error' | 'ready';
  notifications: readonly AppNotification[];
  /** Instant de référence pour les délais et les périodes. */
  now: Date;
  errorMessage?: string;
  markingAll?: boolean;
  onBack: () => void;
  onRetry: () => void;
  onMarkAll: () => void;
  onOpen: (notification: AppNotification) => void;
}

/** Centre de notifications (maquette `NotificationsScreen`), présentation pure. */
export function NotificationsView({
  status,
  notifications,
  now,
  errorMessage,
  markingAll = false,
  onBack,
  onRetry,
  onMarkAll,
  onOpen,
}: NotificationsViewProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('all');

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { all: 0, mission: 0, message: 0, finance: 0 };
    for (const item of notifications) {
      if (item.is_read) continue;
      result.all += 1;
      const category = categoryOf(item);
      if (category !== 'account') result[category] += 1;
    }
    return result;
  }, [notifications]);

  const visible = useMemo(
    () =>
      tab === 'all' ? notifications : notifications.filter((item) => categoryOf(item) === tab),
    [notifications, tab],
  );
  const groups = groupByPeriod(visible, now);
  const hasUnread = counts.all > 0;

  return (
    <Screen testID="notifications">
      <TopBar
        title={t('notifications:title')}
        onBack={onBack}
        trailing={
          <TextAction
            label={t('notifications:readAll')}
            onPress={onMarkAll}
            disabled={!hasUnread || markingAll}
          />
        }
      />
      <Tabs
        items={TAB_KEYS.map((key) => ({
          key,
          label: t(`notifications:tabs.${key}`),
          count: counts[key],
        }))}
        activeKey={tab}
        onSelect={(key) => setTab(key as TabKey)}
      />
      {status === 'loading' ? (
        <View style={{ paddingVertical: 48 }}>
          <ActivityIndicator accessibilityLabel={t('common:states.loading')} />
        </View>
      ) : status === 'error' ? (
        <EmptyState
          icon="close"
          tone="danger"
          title={t('notifications:errorTitle')}
          message={errorMessage ?? t('notifications:actionFailed')}
          actionLabel={t('notifications:retry')}
          onAction={onRetry}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon="bell"
          title={t('notifications:emptyTitle')}
          message={tab === 'all' ? t('notifications:emptyBody') : t('notifications:emptyTabBody')}
        />
      ) : (
        groups.map((group) => (
          <View key={group.period}>
            <Text
              variant="eyebrow"
              tone="muted"
              style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, letterSpacing: 1 }}
            >
              {t(`notifications:periods.${group.period}`)}
            </Text>
            {group.items.map((item) => (
              <NotificationRow key={item.id} notification={item} now={now} onOpen={onOpen} />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

function NotificationRow({
  notification,
  now,
  onOpen,
}: {
  notification: AppNotification;
  now: Date;
  onOpen: (notification: AppNotification) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const unread = !notification.is_read;
  const elapsed = elapsedOf(notification.created_at, now);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      accessibilityHint={notification.body ?? undefined}
      onPress={() => onOpen(notification)}
      testID={`notification-${notification.id}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        backgroundColor: pressed
          ? theme.colors.surfaceMuted
          : unread
            ? `${theme.colors.primary}0A`
            : 'transparent',
      })}
    >
      {unread ? (
        <View
          testID={`non-lue-${notification.id}`}
          style={{
            position: 'absolute',
            left: 6,
            top: 22,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.colors.primary,
          }}
        />
      ) : null}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          backgroundColor: theme.tint.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={ICON_BY_CATEGORY[categoryOf(notification)]} size={18} tone="primary" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <Text
            variant="labelStrong"
            style={{
              flex: 1,
              fontFamily: unread ? theme.fontFamily.bodyBold : theme.fontFamily.bodySemiBold,
            }}
          >
            {notification.title}
          </Text>
          {elapsed ? (
            <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {t(`notifications:elapsed.${elapsed.unit}`, { count: elapsed.count })}
            </Text>
          ) : null}
        </View>
        {notification.body ? (
          <Text
            variant="caption"
            tone="muted"
            style={{ fontFamily: theme.fontFamily.body, lineHeight: 17 }}
          >
            {notification.body}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
