import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme, type Theme } from '@/core/theme';

import { ICON_SHAPES, type IconName } from './icons';

export type { IconName } from './icons';

export type IconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'onPrimary'
  | 'onPrimaryFixed'
  | 'danger'
  | 'warning'
  | 'success';

const COLOR_BY_TONE: Record<IconTone, keyof Theme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  onPrimary: 'onPrimary',
  onPrimaryFixed: 'onPrimaryFixed',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
};

/** Trait Lucide des maquettes : 2 jusqu'à 14 points, 1,85 jusqu'à 18, 1,75 au-delà. */
export function strokeFor(size: number): number {
  if (size <= 14) return 2;
  if (size <= 18) return 1.85;
  return 1.75;
}

export interface IconProps {
  name: IconName;
  /** Côté du carré de dessin, en points. */
  size?: number;
  tone?: IconTone;
  /** Couleur explicite, prioritaire sur `tone`. */
  color?: string;
  /** Épaisseur imposée ; à défaut, celle des maquettes pour la taille. */
  strokeWidth?: number;
  /** Fourni, l'icône devient porteuse de sens pour les lecteurs d'écran. */
  label?: string;
  testID?: string;
}

/** Icône au trait, tracés repris des maquettes. Décorative par défaut. */
export function Icon({
  name,
  size = 20,
  tone = 'default',
  color,
  strokeWidth,
  label,
  testID,
}: IconProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors[COLOR_BY_TONE[tone]];
  const common = {
    stroke,
    strokeWidth: strokeWidth ?? strokeFor(size),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      testID={testID}
      accessible={label !== undefined}
      accessibilityRole={label !== undefined ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label === undefined ? 'no' : 'yes'}
    >
      {ICON_SHAPES[name].map((shape, index) => {
        if (shape.kind === 'path') return <Path key={index} d={shape.d} {...common} />;
        if (shape.kind === 'circle')
          return <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />;
        return (
          <Rect
            key={index}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx}
            {...common}
          />
        );
      })}
    </Svg>
  );
}
