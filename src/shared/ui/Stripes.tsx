import { useId } from 'react';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

export interface StripesProps {
  width: number;
  height: number;
  /** Deux teintes alternées. */
  colors: readonly [string, string];
  /** Largeur d'une bande, en points. */
  band: number;
  /** Angle des bandes, en degrés. */
  angle: number;
  radius?: number;
}

/** Fond rayé des maquettes (`repeating-linear-gradient`), dessiné en SVG. */
export function Stripes({ width, height, colors, band, angle, radius = 0 }: StripesProps) {
  const id = `rayures${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={band * 2}
          height={band * 2}
          patternTransform={`rotate(${angle})`}
        >
          <Rect x={0} y={0} width={band} height={band * 2} fill={colors[0]} />
          <Rect x={band} y={0} width={band} height={band * 2} fill={colors[1]} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} rx={radius} fill={`url(#${id})`} />
    </Svg>
  );
}
