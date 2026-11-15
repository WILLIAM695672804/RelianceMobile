import { View } from 'react-native';

import { useTheme, type Theme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type PillSize = 'sm' | 'md' | 'lg';

const SIZES: Record<PillSize, { height: number; padding: number; fontSize: number }> = {
  sm: { height: 24, padding: 10, fontSize: 12 },
  md: { height: 28, padding: 12, fontSize: 13 },
  lg: { height: 32, padding: 14, fontSize: 13 },
};

const FOREGROUND: Record<PillTone, keyof Theme['colors']> = {
  neutral: 'text',
  primary: 'onPrimaryFixed',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export interface PillProps {
  label: string;
  tone?: PillTone;
  size?: PillSize;
  icon?: IconName;
  testID?: string;
}

/** Pastille d'état, non interactive (statut, catégorie, compteur). */
export function Pill({ label, tone = 'neutral', size = 'md', icon, testID }: PillProps) {
  const theme = useTheme();
  const spec = SIZES[size];
  const color = theme.colors[FOREGROUND[tone]];
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        height: spec.height,
        paddingHorizontal: spec.padding,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.tint[tone],
      }}
    >
      {icon ? <Icon name={icon} size={14} color={color} /> : null}
      <Text variant="labelStrong" numberOfLines={1} style={{ color, fontSize: spec.fontSize }}>
        {label}
      </Text>
    </View>
  );
}
