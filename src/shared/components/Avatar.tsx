import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  /** Diamètre en points. */
  size?: number;
  testID?: string;
}

/** Initiales des deux premiers mots du nom. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Photo de profil ou, à défaut, initiales sur fond atténué. */
export function Avatar({ name, uri, size = 64, testID }: AvatarProps) {
  const theme = useTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        testID={testID}
        source={{ uri }}
        accessibilityLabel={name}
        accessibilityRole="image"
        style={shape}
      />
    );
  }
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={name}
      accessibilityRole="image"
      style={[styles.fallback, shape, { backgroundColor: theme.colors.surfaceMuted }]}
    >
      <Text variant="subtitle" tone="primary">
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
