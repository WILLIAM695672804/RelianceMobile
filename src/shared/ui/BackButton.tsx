import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';

const SIZE = 40;

export interface BackButtonProps {
  onPress: () => void;
  label?: string;
}

/** Bouton de retour rond et cerclé des maquettes ; zone tactile portée à 48 points. */
export function BackButton({ onPress, label }: BackButtonProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? t('common:actions.back')}
      onPress={onPress}
      hitSlop={(MIN_TOUCH_TARGET - SIZE) / 2}
      style={({ pressed }) => ({
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Icon name="chevronL" size={18} />
    </Pressable>
  );
}
