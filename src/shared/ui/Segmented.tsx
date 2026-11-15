import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface SegmentedProps {
  items: readonly { key: string; label: string }[];
  activeKey: string;
  onSelect: (key: string) => void;
  testID?: string;
}

/** Sélecteur segmenté des maquettes : segment actif plein, sur un rail cerclé. */
export function Segmented({ items, activeKey, onSelect, testID }: SegmentedProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        gap: 6,
        padding: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
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
            hitSlop={{ top: (MIN_TOUCH_TARGET - 34) / 2, bottom: (MIN_TOUCH_TARGET - 34) / 2 }}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? theme.colors.text : 'transparent',
            }}
          >
            <Text
              variant="caption"
              numberOfLines={1}
              style={{
                fontFamily: theme.fontFamily.bodySemiBold,
                color: active ? theme.colors.background : theme.colors.textMuted,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
