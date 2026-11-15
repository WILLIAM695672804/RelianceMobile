import { Pressable, ScrollView, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface TabItem {
  key: string;
  label: string;
  /** Compteur affiché dans une pastille lorsque l'onglet est actif. */
  count?: number;
}

export interface TabsProps {
  items: readonly TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  testID?: string;
}

/** Onglets soulignés des maquettes, défilant horizontalement. */
export function Tabs({ items, activeKey, onSelect, testID }: TabsProps) {
  const theme = useTheme();
  return (
    <View testID={testID} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
      >
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              onPress={() => onSelect(item.key)}
              style={{
                minHeight: MIN_TOUCH_TARGET,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderBottomWidth: 2,
                borderBottomColor: active ? theme.colors.primary : 'transparent',
                marginBottom: -1,
              }}
            >
              <Text
                variant="label"
                style={{
                  color: active ? theme.colors.text : theme.colors.textMuted,
                  fontFamily: active ? theme.fontFamily.bodyBold : theme.fontFamily.bodyMedium,
                }}
              >
                {item.label}
              </Text>
              {active && item.count ? (
                <View
                  style={{
                    paddingHorizontal: 6,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.onPrimary,
                      fontFamily: theme.fontFamily.bodyBold,
                      fontSize: 10,
                      lineHeight: 15,
                    }}
                  >
                    {item.count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
