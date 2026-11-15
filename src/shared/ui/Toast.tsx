import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Les cinq niveaux de la maquette `ToastsScreen`. */
export type ToastKind = 'success' | 'warning' | 'error' | 'info' | 'badge';

const ICONS: Record<ToastKind, IconName> = {
  success: 'check',
  warning: 'info',
  error: 'close',
  info: 'bolt',
  badge: 'sparkle',
};

export function toastColor(kind: ToastKind, theme: Theme): string {
  switch (kind) {
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'error':
      return theme.colors.danger;
    default:
      return theme.colors.primary;
  }
}

export interface ToastContent {
  kind: ToastKind;
  title: string;
  body?: string;
  /** Horodatage court affiché à droite (« maintenant », « 5 s »). */
  when?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastProps extends ToastContent {
  onClose?: () => void;
  testID?: string;
}

/** Toast des maquettes : liseré coloré, tuile d'icône, titre, corps, action, fermeture. */
export function Toast({
  kind,
  title,
  body,
  when,
  actionLabel,
  onAction,
  onClose,
  testID,
}: ToastProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const color = toastColor(kind, theme);
  const dark = theme.scheme === 'dark';
  return (
    <View
      testID={testID}
      accessible={!actionLabel && !onClose}
      accessibilityRole="alert"
      accessibilityLabel={[title, body].filter(Boolean).join('. ')}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: theme.radius.tile,
        borderWidth: 1,
        borderLeftWidth: 4,
        borderColor: theme.colors.border,
        borderLeftColor: color,
        backgroundColor: theme.colors.surface,
        boxShadow: dark ? '0px 6px 20px rgba(0, 0, 0, 0.4)' : '0px 6px 20px rgba(0, 0, 0, 0.06)',
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          backgroundColor: `${color}1A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={ICONS[kind]} size={16} strokeWidth={2.2} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            variant="labelStrong"
            style={{ flex: 1, fontFamily: theme.fontFamily.bodyBold }}
            numberOfLines={2}
          >
            {title}
          </Text>
          {when ? (
            <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {when}
            </Text>
          ) : null}
        </View>
        {body ? (
          <Text
            variant="caption"
            tone="muted"
            style={{ marginTop: 2, fontFamily: theme.fontFamily.body }}
          >
            {body}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            hitSlop={{ top: 12, bottom: 12 }}
            style={{
              alignSelf: 'flex-start',
              marginTop: 6,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: theme.radius.pill,
              backgroundColor: color,
            }}
          >
            <Text
              variant="caption"
              style={{ color: '#ffffff', fontFamily: theme.fontFamily.bodySemiBold, fontSize: 11 }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common:toast.close')}
          onPress={onClose}
          hitSlop={(MIN_TOUCH_TARGET - 14) / 2}
        >
          <Icon name="close" size={14} tone="muted" />
        </Pressable>
      ) : null}
    </View>
  );
}
