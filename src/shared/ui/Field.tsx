import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

import { MAX_FONT_SCALE, MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: IconName;
  /** Saisie masquée, avec un bouton pour l'afficher. */
  secure?: boolean;
  /** Message d'erreur affiché sous le champ. */
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  testID?: string;
}

/** Champ des maquettes : libellé au-dessus, cadre de 52 points, icône d'appel facultative. */
export function Field({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  icon,
  secure = false,
  error,
  keyboardType,
  autoComplete,
  autoCapitalize,
  testID,
}: FieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const hidden = secure && !revealed;

  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="muted" style={{ letterSpacing: 0.2 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 52,
          paddingLeft: 14,
          paddingRight: secure ? 2 : 14,
          borderRadius: theme.radius.tile,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        {icon ? <Icon name={icon} size={18} tone="muted" /> : null}
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={error}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            flex: 1,
            height: '100%',
            fontFamily: theme.fontFamily.body,
            fontSize: 15,
            color: theme.colors.text,
          }}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              revealed ? 'common:field.hidePassword' : 'common:field.showPassword',
            )}
            onPress={() => setRevealed((current) => !current)}
            style={{
              width: MIN_TOUCH_TARGET,
              height: MIN_TOUCH_TARGET,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="eye" size={18} tone={revealed ? 'primary' : 'muted'} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityRole="text">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
