import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface TextFieldProps extends Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'onBlur'
  | 'secureTextEntry'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'placeholder'
  | 'testID'
  | 'multiline'
> {
  label: string;
  /** Message déjà traduit. */
  error?: string;
}

export function TextField({ label, error, multiline, ...inputProps }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.text,
            fontFamily: theme.fontFamily.body,
            minHeight: multiline ? 96 : 48,
          },
        ]}
      />
      {error ? (
        <Text accessibilityRole="alert" variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  input: { borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
});
