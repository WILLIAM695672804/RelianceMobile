import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme, type Theme } from '@/core/theme';

import { ICON_SHAPES, type IconName } from './icons';

export type { IconName } from './icons';

export type IconTone =
  'default' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'warning' | 'success';

const COLOR_BY_TONE: Record<IconTone, keyof Theme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  onPrimary: 'onPrimary',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
};

export interface IconProps {
  name: IconName;
  /** Côté du carré de dessin, en points. */
  size?: number;
  tone?: IconTone;
  /** Couleur explicite, prioritaire sur `tone`. */
  color?: string;
  /** Épaisseur du trait ; 1,8 dans les maquettes. */
  strokeWidth?: number;
  /** Fourni, l'icône devient porteuse de sens pour les lecteurs d'écran. */
  label?: string;
  testID?: string;
}

/** Icône au trait, tracés repris des maquettes. Décorative par défaut. */
export function Icon({
  name,
  size = 22,
  tone = 'default',
  color,
  strokeWidth = 1.8,
  label,
  testID,
}: IconProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors[COLOR_BY_TONE[tone]];
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
        const common = {
          stroke,
          strokeWidth,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
          fill: 'none' as const,
        };
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
