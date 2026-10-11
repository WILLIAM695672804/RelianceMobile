import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

export interface StepIndicatorProps {
  /** Nombre total d'étapes. */
  steps: number;
  /** Index de l'étape courante, à partir de zéro. */
  current: number;
  testID?: string;
}

/** Jauge d'avancement par segments, reprise des maquettes de demande. */
export function StepIndicator({ steps, current, testID }: StepIndicatorProps) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: steps, now: current + 1 }}
      style={styles.row}
      testID={testID}
    >
      {Array.from({ length: steps }, (_, index) => (
        <View
          key={index}
          testID={testID ? `${testID}-bar-${index}` : undefined}
          style={[
            styles.bar,
            { backgroundColor: index <= current ? theme.colors.primary : theme.colors.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
});
