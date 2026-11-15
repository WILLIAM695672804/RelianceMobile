import { View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon } from './Icon';

/** Coche ronde « vérifié ». */
export function VerifiedMark({ size = 18 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="check" size={Math.round(size * 0.6)} strokeWidth={3} tone="onPrimary" />
    </View>
  );
}
