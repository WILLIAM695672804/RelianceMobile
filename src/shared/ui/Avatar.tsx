import { Image, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Stripes } from './Stripes';
import { Text } from './Text';

/** Initiales d'un nom : deux premières lettres des deux premiers mots, en capitales. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: number;
  /** Couleur de marque de la personne ; à défaut, l'accent du thème. */
  color?: string;
  /** `striped` : gabarit rayé des maquettes, en attendant une photo. */
  variant?: 'solid' | 'striped';
  /** Photo de profil ; à défaut, les initiales. */
  uri?: string | null;
  testID?: string;
}

/** Pastille ronde aux initiales. */
export function Avatar({ name, size = 40, color, variant = 'solid', uri, testID }: AvatarProps) {
  const theme = useTheme();
  const accent = color ?? theme.colors.primary;
  const striped = variant === 'striped';
  const foreground = striped ? accent : color ? '#ffffff' : theme.colors.onPrimary;
  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: striped ? undefined : accent,
      }}
    >
      {striped ? (
        <Stripes
          width={size}
          height={size}
          colors={[`${accent}22`, `${accent}33`]}
          band={4}
          angle={45}
        />
      ) : null}
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text
          variant="bodyStrong"
          style={{
            color: foreground,
            fontFamily: theme.fontFamily.display,
            fontSize: Math.round(size * 0.36),
            lineHeight: Math.round(size * 0.44),
          }}
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
