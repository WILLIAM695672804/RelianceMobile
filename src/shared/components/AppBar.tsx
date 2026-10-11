import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface AppBarProps {
  title: string;
  /** Fourni, affiche la flèche de retour à gauche du titre. */
  onBack?: () => void;
  /** Actions alignées à droite (icônes pressables). */
  actions?: ReactNode;
}

/**
 * Barre supérieure selon la convention Android : flèche de retour puis titre aligné
 * à gauche, actions à droite. Les maquettes sont cadrées iOS (titre centré) ; cet
 * écart est assumé, voir les décisions de conception du Plan 13.
 */
export function AppBar({ title, onBack, actions }: AppBarProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      testID="app-bar"
      style={[
        styles.bar,
        { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.divider },
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common:actions.back')}
          onPress={onBack}
          android_ripple={{ color: theme.tint.neutral, borderless: true, radius: 24 }}
          style={styles.backButton}
        >
          <Icon name="arrowL" size={24} />
        </Pressable>
      ) : null}
      <Text variant="subtitle" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 56,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, paddingHorizontal: 12 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
