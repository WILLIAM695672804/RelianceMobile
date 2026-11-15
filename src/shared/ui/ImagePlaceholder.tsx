import { useState } from 'react';
import { View, type DimensionValue } from 'react-native';

import { useTheme, type Theme } from '@/core/theme';

import { Stripes } from './Stripes';
import { Text } from './Text';

export type PlaceholderTone = 'neutral' | 'dark' | 'primary' | 'blue';

/** Teintes des maquettes en thème clair ; le thème sombre reprend ses surfaces. */
function stripesFor(tone: PlaceholderTone, theme: Theme): [string, string] {
  if (tone === 'dark') return ['#212128', '#292931'];
  const dark = theme.scheme === 'dark';
  switch (tone) {
    case 'primary':
      return dark ? [theme.colors.primaryFixed, theme.colors.surfaceHigh] : ['#efeaff', '#e4dcff'];
    case 'blue':
      return dark
        ? [theme.colors.surfaceContainer, theme.colors.surfaceHigh]
        : ['#f0f0f3', '#e4e4ea'];
    default:
      return dark ? [theme.colors.surfaceMuted, theme.colors.surfaceHigh] : ['#f6f6f8', '#eaeaef'];
  }
}

export interface ImagePlaceholderProps {
  label: string;
  height?: number;
  width?: DimensionValue;
  radius?: number;
  tone?: PlaceholderTone;
  testID?: string;
}

/** Emplacement d'image rayé et légendé, en attendant le visuel réel. */
export function ImagePlaceholder({
  label,
  height = 120,
  width = '100%',
  radius = 14,
  tone = 'neutral',
  testID,
}: ImagePlaceholderProps) {
  const theme = useTheme();
  const [measured, setMeasured] = useState(0);
  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={(event) => setMeasured(event.nativeEvent.layout.width)}
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {measured > 0 ? (
        <Stripes
          width={measured}
          height={height}
          colors={stripesFor(tone, theme)}
          band={8}
          angle={135}
          radius={radius}
        />
      ) : null}
      <Text
        variant="labelStrong"
        style={{
          fontSize: 12,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: tone === 'dark' ? '#a8a6b8' : theme.colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
