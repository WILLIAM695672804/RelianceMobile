import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, Screen, StateView, Text } from '@/shared/components';

import { useNotificationSettings, useUpdateNotificationSettings } from '../hooks/useNotifications';
import {
  NOTIFICATION_CHANNELS,
  type ChannelMap,
  type NotificationChannel,
} from '../schemas/notificationSchemas';

/** Préférences de notification : un canal se bascule au toucher, l'ensemble s'enregistre. */
export function NotificationSettingsScreen() {
  const settings = useNotificationSettings();

  if (settings.isPending) {
    return (
      <Screen>
        <StateView status="loading" />
      </Screen>
    );
  }
  if (settings.isError) {
    return (
      <Screen>
        <StateView status="error" error={settings.error} onRetry={() => void settings.refetch()} />
      </Screen>
    );
  }
  return <SettingsForm initial={settings.data} />;
}

function SettingsForm({ initial }: { initial: ChannelMap }) {
  const { t } = useTranslation();
  const update = useUpdateNotificationSettings();
  const [draft, setDraft] = useState<ChannelMap>(initial);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (channel: NotificationChannel) => {
    setNotice(null);
    setError(null);
    setDraft((current) => ({ ...current, [channel]: !current[channel] }));
  };

  const save = async () => {
    setNotice(null);
    setError(null);
    try {
      await update.mutateAsync(draft);
      setNotice(t('notifications:settings.saved'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('notifications:settings.title')}
      </Text>
      <Text tone="muted">{t('notifications:settings.hint')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {NOTIFICATION_CHANNELS.map((channel) => {
        const label = t(`notifications:settings.${channel}`);
        return (
          <Card key={channel}>
            <View style={styles.row}>
              <Text>{label}</Text>
              <Text tone={draft[channel] ? 'primary' : 'muted'}>
                {t(
                  draft[channel]
                    ? 'notifications:settings.enabled'
                    : 'notifications:settings.disabled',
                )}
              </Text>
            </View>
            {channel === 'push' ? (
              <Text variant="caption" tone="muted">
                {t('notifications:settings.pushHint')}
              </Text>
            ) : null}
            <Button
              label={t('notifications:settings.toggle', { channel: label })}
              accessibilityLabel={t('notifications:settings.toggle', { channel: label })}
              onPress={() => toggle(channel)}
              variant="secondary"
            />
          </Card>
        );
      })}
      <Button
        label={t('notifications:settings.submit')}
        onPress={() => void save()}
        loading={update.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
