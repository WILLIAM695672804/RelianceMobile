import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';

import { BackButton } from './BackButton';
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
      {onBack ? <BackButton onPress={onBack} label={backLabel} /> : null}
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
  tone?: 'primary' | 'muted';
}

/** Action textuelle d'une barre de titre (« Tout lire », « Rejouer »). */
export function TextAction({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: TextActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', paddingHorizontal: 4 }}
    >
      <Text
        variant={tone === 'muted' ? 'label' : 'labelStrong'}
        tone={tone}
        style={{ opacity: disabled ? 0.4 : 1 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
