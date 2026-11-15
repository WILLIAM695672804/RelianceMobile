import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'soft' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };
const PADDING: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 24 };

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  /** Occupe toute la largeur disponible. */
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Bouton pilule des maquettes. Sous 48 points de hauteur, la zone tactile est étendue par
 * `hitSlop` sans modifier le dessin.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  full = false,
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const height = HEIGHT[size];
  const slop = Math.max(0, (MIN_TOUCH_TARGET - height) / 2);
  const inactive = disabled || loading;
  const look = {
    primary: { background: theme.colors.primary, foreground: theme.colors.onPrimary, border: 0 },
    soft: { background: theme.colors.surfaceHigh, foreground: theme.colors.text, border: 0 },
    ghost: { background: 'transparent', foreground: theme.colors.text, border: 1 },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          paddingHorizontal: PADDING[size],
          borderRadius: theme.radius.pill,
          backgroundColor: look.background,
          borderWidth: look.border,
          borderColor: theme.colors.outlineVariant,
          opacity: inactive ? 0.4 : pressed ? 0.85 : 1,
          alignSelf: full ? 'stretch' : 'auto',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.foreground} testID={testID && `${testID}-chargement`} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={look.foreground} /> : null}
          <Text
            variant={size === 'sm' ? 'labelStrong' : 'bodyStrong'}
            numberOfLines={1}
            style={{ color: look.foreground }}
          >
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={18} color={look.foreground} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
