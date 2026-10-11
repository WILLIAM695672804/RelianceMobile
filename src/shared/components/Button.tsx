import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icône placée avant le libellé. */
  icon?: IconName;
  /** Étire le bouton sur toute la largeur disponible. */
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Libellé d'accessibilité, si différent du texte affiché. */
  accessibilityLabel?: string;
  testID?: string;
}

const SIZES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; radius: number; icon: number }
> = {
  sm: { height: MIN_TOUCH_TARGET - 8, paddingHorizontal: 14, radius: 10, icon: 16 },
  md: { height: MIN_TOUCH_TARGET, paddingHorizontal: 18, radius: 12, icon: 18 },
  lg: { height: 56, paddingHorizontal: 22, radius: 14, icon: 20 },
};

/**
 * Bouton selon la convention Android : cible tactile d'au moins 48 dp (hitSlop pour la
 * taille réduite) et onde de pression. Les rayons suivent les maquettes (10/12/14).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const metrics = SIZES[size];

  const background = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceMuted,
    ghost: 'transparent',
    danger: theme.colors.danger,
  }[variant];
  const foreground = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.onPrimary,
  }[variant];
  const tone = variant === 'primary' || variant === 'danger' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      hitSlop={size === 'sm' ? 8 : undefined}
      android_ripple={{
        color:
          variant === 'primary' || variant === 'danger'
            ? 'rgba(255,255,255,0.24)'
            : theme.tint.primary,
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: metrics.height,
          paddingHorizontal: metrics.paddingHorizontal,
          borderRadius: metrics.radius,
          backgroundColor: background,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inactive ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Icon
              name={icon}
              size={metrics.icon}
              color={foreground}
              testID={testID ? `${testID}-icon` : undefined}
            />
          ) : null}
          <Text variant={size === 'sm' ? 'label' : 'subtitle'} tone={tone} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
