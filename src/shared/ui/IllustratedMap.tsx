import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/core/theme';

import { Text } from './Text';

export interface MapPin {
  id: string;
  label: string;
  /** Position en pourcentage du cadre. */
  x: number;
  y: number;
  color?: string;
}

export interface IllustratedMapProps {
  pins?: readonly MapPin[];
  /** Position de l'utilisateur, en pourcentage du cadre. */
  you?: { x: number; y: number } | null;
  /** Format réduit (aperçu) : épingles et quadrillage plus petits. */
  compact?: boolean;
  testID?: string;
}

/**
 * Carte illustrée des maquettes (`MapPlaceholder`) : fond, routes, parc, épingles des
 * techniciens et position de l'utilisateur. Sert le prototype en attendant la carte MapLibre.
 */
export function IllustratedMap({
  pins = [],
  you = { x: 50, y: 50 },
  compact = false,
  testID,
}: IllustratedMapProps) {
  const theme = useTheme();
  const dark = theme.scheme === 'dark';
  const road = dark ? '#212128' : '#B6AB8B';
  const grid = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const cell = compact ? 20 : 32;
  const pin = compact ? 24 : 36;
  const dot = compact ? 14 : 20;

  return (
    <View testID={testID} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="fond" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={dark ? '#1F1E1A' : '#DDD7C5'} />
            <Stop offset="1" stopColor={dark ? '#16140F' : '#C9C0A6'} />
          </LinearGradient>
          <Pattern id="grille" patternUnits="userSpaceOnUse" width={cell} height={cell}>
            <Path d={`M ${cell} 0 L 0 0 0 ${cell}`} stroke={grid} strokeWidth={1} fill="none" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fond)" />
        <Rect width="100%" height="100%" fill="url(#grille)" opacity={0.45} />
      </Svg>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Path d="M-5 30 Q 30 28 60 50 T 105 60" stroke={road} strokeWidth={3.5} fill="none" />
        <Path d="M20 -5 Q 25 40 45 60 T 60 105" stroke={road} strokeWidth={3} fill="none" />
        <Path d="M-5 75 L 105 80" stroke={road} strokeWidth={2.5} fill="none" />
        <Path
          d="M70 -5 L 75 105"
          stroke={dark ? '#17161f' : '#A89D7E'}
          strokeWidth={1.5}
          fill="none"
        />
        <Ellipse
          cx={80}
          cy={22}
          rx={14}
          ry={10}
          fill={dark ? '#1A2620' : '#A8C0A0'}
          opacity={0.7}
        />
        <Rect
          x={8}
          y={62}
          width={14}
          height={14}
          rx={1}
          fill={dark ? '#1b1b21' : '#B6AB8B'}
          opacity={0.5}
        />
      </Svg>
      {pins.map((item) => (
        <View
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            alignItems: 'center',
            transform: [{ translateX: -pin / 2 }, { translateY: -(pin + 4) }],
          }}
        >
          <View
            style={{
              width: pin,
              height: pin,
              borderRadius: pin / 2,
              borderWidth: 2.5,
              borderColor: '#ffffff',
              backgroundColor: item.color ?? theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Text
              variant="caption"
              style={{
                color: '#ffffff',
                fontFamily: theme.fontFamily.display,
                fontSize: compact ? 9 : 12,
                lineHeight: compact ? 11 : 14,
              }}
            >
              {item.label}
            </Text>
          </View>
          <View
            style={{
              width: 2,
              height: 6,
              marginTop: -2,
              backgroundColor: item.color ?? theme.colors.primary,
            }}
          />
        </View>
      ))}
      {you ? (
        <View
          style={{
            position: 'absolute',
            left: `${you.x}%`,
            top: `${you.y}%`,
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            borderWidth: 3,
            borderColor: '#ffffff',
            backgroundColor: theme.colors.primary,
            transform: [{ translateX: -dot / 2 }, { translateY: -dot / 2 }],
            boxShadow: `0px 0px 0px 6px ${theme.colors.primary}33`,
          }}
        />
      ) : null}
    </View>
  );
}
