import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName, type IconTone } from './Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Obligatoire : un bouton d'icône n'a pas de texte pour l'annoncer. */
  accessibilityLabel: string;
  onPress: () => void;
  tone?: IconTone;
  /** Pose l'icône sur un carré teinté, comme dans l'en-tête des maquettes. */
  filled?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** Bouton d'icône de 48 dp, pour les actions de barre supérieure et d'en-tête. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'default',
  filled = false,
  disabled = false,
  testID,
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      android_ripple={{ color: theme.tint.primary, borderless: !filled, radius: 24 }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: filled ? theme.colors.surfaceMuted : 'transparent',
          borderRadius: filled ? theme.radius.md : theme.radius.pill,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Icon name={icon} size={22} tone={tone} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
