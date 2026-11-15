import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface TopBarProps {
  title: string;
  /** Fourni, affiche le bouton rond de retour des maquettes. */
  onBack?: () => void;
  backLabel?: string;
  /** Action textuelle ou bouton à droite. */
  trailing?: ReactNode;
  /** `start` : grand titre aligné à gauche (22 points) ; `center` : titre d'étape (15 points). */
  align?: 'start' | 'center';
  testID?: string;
}

/** Barre de titre des maquettes : retour rond cerclé, titre, action à droite. */
export function TopBar({
  title,
  onBack,
  backLabel,
  trailing,
  align = 'start',
  testID,
}: TopBarProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const centered = align === 'center';
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        minHeight: 56,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel ?? t('common:actions.back')}
          onPress={onBack}
          hitSlop={(MIN_TOUCH_TARGET - 40) / 2}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevronL" size={18} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          variant={centered ? 'bodyStrong' : 'title'}
          align={centered ? 'center' : 'left'}
          accessibilityRole="header"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {trailing ?? (centered && onBack ? <View style={{ width: 40 }} /> : null)}
    </View>
  );
}

export interface TextActionProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Action textuelle d'une barre de titre (« Tout lire », « Rejouer »). */
export function TextAction({ label, onPress, disabled = false }: TextActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', paddingHorizontal: 4 }}
    >
      <Text variant="labelStrong" tone="primary" style={{ opacity: disabled ? 0.4 : 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}
