import type { ColorValue } from 'react-native';

import { useTheme } from '@/core/theme';
import { Icon, type IconName } from '@/shared/components';

export interface TabIconArgs {
  /** `ColorValue` et non `string` : la navigation transmet aussi des couleurs opaques. */
  color: ColorValue;
  focused: boolean;
  size: number;
}

/**
 * Fabrique l'icône d'un onglet. Le trait s'épaissit sur l'onglet actif, à défaut
 * d'un jeu d'icônes pleines dans les maquettes.
 */
export function tabIcon(name: IconName) {
  return function renderTabIcon({ color, focused }: TabIconArgs) {
    return (
      <Icon
        name={name}
        size={24}
        color={color as string}
        strokeWidth={focused ? 2.4 : 1.8}
        testID={`tab-icon-${name}`}
      />
    );
  };
}

/**
 * Options communes aux barres d'onglets, selon le gabarit Material 3. Le type est
 * déduit du littéral : `@react-navigation/bottom-tabs` n'est pas une dépendance
 * directe du projet, et la conformité est vérifiée au point d'usage par `Tabs`.
 */
export function useTabBarStyle() {
  const theme = useTheme();
  return {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarLabelPosition: 'below-icon' as const,
    tabBarLabelStyle: { fontFamily: theme.fontFamily.bodyMedium, fontSize: 11 },
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.divider,
      height: 64,
      paddingTop: 6,
      paddingBottom: 8,
    },
  };
}
