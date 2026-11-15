import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BannerTone = 'success' | 'warning' | 'danger';

const ICONS: Record<BannerTone, IconName> = {
  success: 'shield',
  warning: 'info',
  danger: 'close',
};

function colorOf(tone: BannerTone, theme: Theme): string {
  return theme.colors[tone];
}

export interface BannerProps {
  tone: BannerTone;
  message: string;
  icon?: IconName;
  /** Fournie, la bannière devient un lien (flèche à droite). */
  onPress?: () => void;
  testID?: string;
}

/** Bannière en ligne des maquettes (`ToastsScreen`, « Bannières inline »). */
export function Banner({ tone, message, icon, onPress, testID }: BannerProps) {
  const theme = useTheme();
  const color = colorOf(tone, theme);
  const body = (
    <>
      <Icon name={icon ?? ICONS[tone]} size={16} color={color} />
      <Text variant="caption" style={{ flex: 1, color: theme.colors.text, lineHeight: 17 }}>
        {message}
      </Text>
      {onPress ? (
        <Text variant="caption" style={{ color, fontFamily: theme.fontFamily.bodyBold }}>
          →
        </Text>
      ) : null}
    </>
  );
  const frame = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: `${color}40`,
    backgroundColor: theme.tint[tone],
  };
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="link"
        accessibilityLabel={message}
        onPress={onPress}
        style={[frame, { minHeight: MIN_TOUCH_TARGET }]}
      >
        {body}
      </Pressable>
    );
  }
  return (
    <View testID={testID} accessible accessibilityRole="alert" style={frame}>
      {body}
    </View>
  );
}
