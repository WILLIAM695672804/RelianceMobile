import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import type { AppErrorKind } from '@/core/errors';
import { useTheme } from '@/core/theme';
import {
  Banner,
  Button,
  Card,
  ErrorState,
  Screen,
  SwitchRow,
  Text,
  TopBar,
  type IconName,
} from '@/shared/ui';

import {
  NOTIFICATION_CHANNELS,
  type ChannelMap,
  type NotificationChannel,
} from '../schemas/notificationSchemas';

const ICONS: Record<NotificationChannel, IconName> = {
  in_app: 'bell',
  push: 'phone',
  email: 'send',
  sms: 'chat',
};

export interface NotificationSettingsViewProps {
  status: 'loading' | 'error' | 'ready';
  channels: ChannelMap;
  errorKind?: AppErrorKind;
  /** Le serveur n'émet pas encore de notification poussée : le canal reste désactivé. */
  pushAvailable?: boolean;
  dirty: boolean;
  saving: boolean;
  /** Issue du dernier enregistrement. */
  outcome?: 'saved' | 'failed' | null;
  onToggle: (channel: NotificationChannel, value: boolean) => void;
  onSave: () => void;
  onRetry: () => void;
  onBack: () => void;
}

/** Préférences de notification par canal (sans maquette, style Clean Lavender). */
export function NotificationSettingsView({
  status,
  channels,
  errorKind = 'unknown',
  pushAvailable = false,
  dirty,
  saving,
  outcome,
  onToggle,
  onSave,
  onRetry,
  onBack,
}: NotificationSettingsViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen
      testID="reglages-notifications"
      footer={
        status === 'ready' ? (
          <Button
            label={t('notifications:settings.submit')}
            size="lg"
            full
            disabled={!dirty}
            loading={saving}
            onPress={onSave}
          />
        ) : undefined
      }
    >
      <TopBar title={t('notifications:settings.title')} onBack={onBack} />
      {status === 'loading' ? (
        <View style={{ paddingVertical: 48 }}>
          <ActivityIndicator accessibilityLabel={t('common:states.loading')} />
        </View>
      ) : status === 'error' ? (
        <ErrorState kind={errorKind} onRetry={onRetry} />
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Text variant="body" tone="muted" style={{ fontSize: 14 }}>
            {t('notifications:settings.hint')}
          </Text>
          {outcome === 'saved' ? (
            <Banner tone="success" icon="check" message={t('notifications:settings.saved')} />
          ) : null}
          {outcome === 'failed' ? (
            <Banner tone="danger" message={t('notifications:settings.saveFailed')} />
          ) : null}
          <Text variant="eyebrow" tone="muted" style={{ marginTop: 6, letterSpacing: 1 }}>
            {t('notifications:settings.channels')}
          </Text>
          <Card padding={0}>
            {NOTIFICATION_CHANNELS.map((channel, index) => {
              const unavailable = channel === 'push' && !pushAvailable;
              return (
                <View
                  key={channel}
                  style={{
                    paddingHorizontal: 16,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.divider,
                  }}
                >
                  <SwitchRow
                    icon={ICONS[channel]}
                    label={t(`notifications:settings.${channel}`)}
                    hint={
                      unavailable
                        ? t('notifications:settings.pushHint')
                        : channel === 'push'
                          ? undefined
                          : t(`notifications:settings.hints.${channel}`)
                    }
                    value={unavailable ? false : channels[channel]}
                    disabled={unavailable}
                    onChange={(value) => onToggle(channel, value)}
                    testID={`canal-${channel}`}
                  />
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </Screen>
  );
}
