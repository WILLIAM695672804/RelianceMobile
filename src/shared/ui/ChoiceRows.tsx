import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface RadioRowProps {
  label: string;
  hint?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  /** Teinte de la sélection ; à défaut, l'accent. */
  color?: string;
}

/** Carte à choix unique (motif de litige, d'annulation). */
export function RadioRow({ label, hint, icon, selected, onPress, color }: RadioRowProps) {
  const theme = useTheme();
  const accent = color ?? theme.colors.primary;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? accent : theme.colors.border,
        backgroundColor: selected ? `${accent}0D` : theme.colors.surface,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: selected ? accent : theme.colors.surfaceHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={16} color={selected ? '#ffffff' : theme.colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="labelStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted" style={{ fontSize: 11, marginTop: 1 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: selected ? accent : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
        ) : null}
      </View>
    </Pressable>
  );
}

export interface CheckRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onPress: () => void;
  /** Teinte de la coche ; à défaut, la couleur de réussite. */
  color?: string;
  divider?: boolean;
}

/** Ligne à cocher (vérifications de fin de travaux). */
export function CheckRow({ label, hint, checked, onPress, color, divider = false }: CheckRowProps) {
  const theme = useTheme();
  const accent = color ?? theme.colors.success;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        minHeight: 56,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: theme.colors.divider,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: checked ? accent : theme.colors.outlineVariant,
          backgroundColor: checked ? accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Icon name="check" size={15} strokeWidth={3} color="#ffffff" /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ color: theme.colors.text }}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" tone="muted" style={{ fontSize: 11, marginTop: 1 }}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
