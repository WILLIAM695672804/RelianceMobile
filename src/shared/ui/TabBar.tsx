import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export const TAB_BAR_HEIGHT = 72;
/** Distance entre la barre flottante et le bas de l'écran. */
export const TAB_BAR_OFFSET = 24;
/** Espace à réserver sous un contenu défilant pour qu'il ne passe pas sous la barre. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_OFFSET + 16;

export interface TabBarItem {
  key: string;
  label: string;
  icon: IconName;
}

export interface TabBarProps {
  items: readonly TabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  testID?: string;
}

/** Barre de navigation flottante : pilule, onglet actif sur pastille `primaryFixed`. */
export function TabBar({ items, activeKey, onSelect, testID }: TabBarProps) {
  const theme = useTheme();
  const { gutter, maxContentWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: TAB_BAR_OFFSET + insets.bottom,
        alignItems: 'center',
        paddingHorizontal: gutter,
      }}
    >
      <View
        testID={testID}
        accessibilityRole="tablist"
        style={[
          {
            width: '100%',
            maxWidth: maxContentWidth,
            height: TAB_BAR_HEIGHT,
            paddingHorizontal: 8,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          },
          theme.shadow.nav,
        ]}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          const color = active ? theme.colors.onPrimaryFixed : theme.colors.textMuted;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.key)}
              testID={`onglet-${item.key}`}
              style={{
                minWidth: 56,
                height: TAB_BAR_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? theme.colors.primaryFixed : 'transparent',
                }}
              >
                <Icon name={item.icon} size={22} color={color} />
              </View>
              <Text
                variant="caption"
                numberOfLines={1}
                style={{
                  color,
                  fontFamily: active ? theme.fontFamily.bodyBold : theme.fontFamily.bodyMedium,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
