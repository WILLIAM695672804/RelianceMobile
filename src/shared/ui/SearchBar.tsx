import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { MAX_FONT_SCALE, MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** Libellé pour les lecteurs d'écran (le texte indicatif n'en tient pas lieu). */
  label: string;
  autoFocus?: boolean;
  testID?: string;
}

/** Champ de recherche des maquettes : loupe, saisie, bouton d'effacement rond. */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  label,
  autoFocus = false,
  testID,
}: SearchBarProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 14,
        paddingRight: 6,
        borderRadius: theme.radius.tile,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Icon name="search" size={16} tone="muted" />
      <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
        {value.length === 0 ? (
          <Text
            variant="body"
            tone="muted"
            numberOfLines={1}
            style={{ position: 'absolute', left: 0, right: 0, fontSize: 14 }}
          >
            {placeholder}
          </Text>
        ) : null}
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCorrect={false}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            flex: 1,
            padding: 0,
            fontFamily: theme.fontFamily.body,
            fontSize: 14,
            color: theme.colors.text,
          }}
        />
      </View>
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common:search.clear')}
          onPress={() => onChangeText('')}
          hitSlop={(MIN_TOUCH_TARGET - 22) / 2}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: theme.colors.outlineVariant,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 4,
          }}
        >
          <Icon name="close" size={11} strokeWidth={3} color={theme.colors.background} />
        </Pressable>
      ) : null}
    </View>
  );
}
