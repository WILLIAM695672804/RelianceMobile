import { Pressable, Switch, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface SwitchRowProps {
  label: string;
  hint?: string;
  icon?: IconName;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

/** Ligne de réglage à interrupteur : toute la ligne bascule la valeur. */
export function SwitchRow({
  label,
  hint,
  icon,
  value,
  onChange,
  disabled = false,
  testID,
}: SwitchRowProps) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 56,
        paddingVertical: 10,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
      })}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: theme.tint.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} tone="primary" />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
        thumbColor={theme.colors.surface}
        ios_backgroundColor={theme.colors.outlineVariant}
      />
    </Pressable>
  );
}
