import { View } from 'react-native';

import { useTheme } from '@/core/theme';

/** Barre d'avancement segmentée (phases d'une intervention, étapes d'un parcours). */
export function PhaseBar({ phase, count }: { phase: number; count: number }) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: count, now: phase }}
      style={{ flexDirection: 'row', gap: 4 }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: index < phase ? theme.colors.primary : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}
