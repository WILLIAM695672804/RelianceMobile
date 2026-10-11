import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface SearchFieldProps {
  placeholder: string;
  /** Fournie sans `onChangeText`, le champ se comporte en bouton vers un écran de recherche. */
  onPress?: () => void;
  value?: string;
  onChangeText?: (value: string) => void;
  onSubmitEditing?: () => void;
  testID?: string;
}

/** Barre de recherche : bouton de navigation ou champ de saisie selon les propriétés reçues. */
export function SearchField({
  placeholder,
  onPress,
  value,
  onChangeText,
  onSubmitEditing,
  testID,
}: SearchFieldProps) {
  const theme = useTheme();
  const shell = [
    styles.shell,
    { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md },
  ];

  if (onChangeText) {
    return (
      <View style={shell} testID={testID}>
        <Icon name="search" size={18} tone="muted" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          style={[styles.input, { color: theme.colors.text, fontFamily: theme.fontFamily.body }]}
        />
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={placeholder}
      onPress={onPress}
      testID={testID}
      android_ripple={{ color: theme.tint.primary }}
      style={shell}
    >
      <Icon name="search" size={18} tone="muted" />
      <Text tone="muted" numberOfLines={1} style={styles.flex}>
        {placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  flex: { flex: 1 },
});
